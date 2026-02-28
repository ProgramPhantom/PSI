import type { Request, Response, NextFunction } from 'express';
import { SchemeRepository } from '../repositories/schemeRepository.js';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import type { JsonObject } from '../db/db.js';

const CreateSchemeSchema = z.object({
    name: z.string().min(1),
});
const IdSchema = z.uuid();

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'schemes');

export const deleteScheme = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (req.session.authenticated !== true) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const result = IdSchema.safeParse(req.params.schemeId);
        if (!result.success) {
            res.status(400).json({ message: z.treeifyError(result.error) });
            return;
        }
        const resource = result.data;

        const deleteResponse = await SchemeRepository.deleteById(resource);

        // Also delete the file if it exists
        const filePath = path.join(STORAGE_DIR, `${resource}.nmrs`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (deleteResponse.numDeletedRows > 0) {
            res.status(200).json({ message: `Deleted scheme with Id: ${resource}` });
        } else {
            res.status(404).json({ message: 'Scheme not found' });
        }
    } catch (error) {
        next(error);
    }
};

export const saveScheme = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (req.session.authenticated !== true) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const result = IdSchema.safeParse(req.params.schemeId);
        if (!result.success) {
            res.status(400).json({ message: z.treeifyError(result.error) });
            return;
        }
        const resource = result.data;

        // The file is already saved by multer. We just update the database timestamp/dummy data.
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const updateResponse = await SchemeRepository.saveById(
            resource,
            {}, // No longer storing json data in db
        );

        if (updateResponse.numUpdatedRows > 0) {
            res.status(200).json({ message: `Saved scheme file for Id: ${resource}` });
        } else {
            // Note: If the DB record didn't exist, we might have an orphaned file.
            // A more robust implementation might clean it up or ensure ownership first.
            res.status(404).json({ message: 'Scheme not found in database' });
        }
    } catch (error) {
        next(error);
    }
};

export const createScheme = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (req.session.authenticated !== true) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const id = uuidv7();
        const result = CreateSchemeSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: z.treeifyError(result.error) });
            return;
        }
        const { name } = result.data;

        const dbResponse = await SchemeRepository.createScheme(
            id,
            new Date(),
            req.session.gsub!,
            name,
        );
        if (dbResponse) {
            res.status(201).json({
                message: 'Success: scheme created',
                id: dbResponse.scheme_id,
            });
        } else {
            throw new Error('Database error during creation.');
        }
    } catch (error) {
        next(error);
    }
};

export const loadScheme = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = IdSchema.safeParse(req.params.schemeId);
        if (!result.success) {
            res.status(400).json({ message: z.treeifyError(result.error) });
            return;
        }
        const resource = result.data;

        // Check if DB record exists
        const dbResponse = await SchemeRepository.loadById(resource);
        if (!dbResponse) {
            res.status(404).json({ message: 'Scheme not found in database' });
            return;
        }

        const filePath = path.join(STORAGE_DIR, `${resource}.nmrs`);
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'Scheme file not found on disk' });
        }
    } catch (error) {
        next(error);
    }
};
