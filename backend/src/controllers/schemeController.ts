import type { Request, Response, NextFunction } from 'express';
import { SchemeRepository } from '../repositories/schemeRepository.js';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';
import type { JsonObject } from '../db/db.js';

const CreateSchemeSchema = z.object({
    name: z.string().min(1),
});
const IdSchema = z.uuid();

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

        if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
            res.status(400).json({ message: 'Body must be a JSON object' });
            return;
        }

        const updateResponse = await SchemeRepository.saveById(
            resource,
            req.body as JsonObject,
        );

        if (updateResponse.numUpdatedRows > 0) {
            res.status(200).json({ message: `Saved scheme with Id: ${resource}` });
        } else {
            res.status(404).json({ message: 'Scheme not found' });
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
        const dbResponse = await SchemeRepository.loadById(resource);
        if (dbResponse) {
            res.status(200).json(dbResponse);
        } else {
            res.status(404).json({ message: 'Scheme not found' });
        }
    } catch (error) {
        next(error);
    }
};
