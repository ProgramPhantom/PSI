import type { Request, Response, NextFunction } from 'express';
import { DiagramRepository } from '../repositories/DiagramRepository.js';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';
import type { JsonObject } from '../db/db.js';
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'diagrams');

// ---------- Zod schemas ---------------

const CreateDiagramSchema = z.object({
  name: z.string().min(1),
});
const IdSchema = z.uuid();

// ---------- Controllers --------------

export const deleteDiagram = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.authenticated !== true) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ message: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;

    //compare owner to current session
    const ownerResponse = await DiagramRepository.getOwnerById(resource);
    if (ownerResponse?.owner != req.session.gsub!) {
      res.status(403).json({ message: 'You do not own this diagram' });
      return;
    }

    const deleteResponse = await DiagramRepository.deleteById(resource);

    // Also delete the file if it exists
    const filePath = path.join(STORAGE_DIR, `${resource}.nmrd`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (deleteResponse.numDeletedRows > 0) {
      res.status(200).json({ message: `Deleted diagram with Id: ${resource}` });
    } else {
      res.status(404).json({ message: 'Diagram not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const putSaveDiagram = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.authenticated !== true) {
      if (req.file) fs.unlinkSync(req.file.path);
      // Removes the temp file
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;

    const ownerData = await DiagramRepository.getOwnerById(resource);

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!ownerData) {
      //diagram does not exist
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ message: 'Diagram not found' });
      return;
    }

    //if you own this diagram
    if (ownerData!.owner == req.session.gsub!) {
      //save directly
      const updateResponse = await DiagramRepository.saveById(
        resource
      );
      if (updateResponse.numUpdatedRows > 0) {
        fs.renameSync(req.file.path, path.join(STORAGE_DIR, `${resource}.nmrd`));
        res.status(200).json({ message: `Saved diagram with Id: ${resource}`, copied: false });
      } else {
        if (req.file) fs.unlinkSync(req.file.path);
        throw new Error(
          'No rows updated for an Id that was found??? No clue mate.',
        );
      }

      //else you don't own it
    } else {
      //copy it with a new owner and Id
      const newId = uuidv7();
      const copyResponse = await DiagramRepository.copyDiagramToOwnerById(resource, newId, req.session.gsub!)
      if (copyResponse) {
        //copy succeeded
        fs.renameSync(req.file.path, path.join(STORAGE_DIR, `${newId}.nmrd`));
        res.status(200).json({ message: "Success: Copied to your own diagrams", savedDiagramId: newId, copied: true })
      } else {
        if (req.file) fs.unlinkSync(req.file.path);
        throw new Error("Copy failed for some reason")
      }
    }

  } catch (error) {
    if (req.file) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    next(error);
  }
};

export const postCreateDiagram = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.authenticated !== true) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    //create a blank diagram belonging to the logged in user
    const id = uuidv7();
    const result = CreateDiagramSchema.safeParse(req.body);
    if (!result.success) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: z.treeifyError(result.error) });
      return;
    }
    const { name } = result.data;

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const dbResponse = await DiagramRepository.createDiagram(
      id,
      new Date(),
      req.session.gsub!,
      name,
    );
    if (dbResponse) {
      fs.renameSync(req.file.path, path.join(STORAGE_DIR, `${dbResponse.diagram_id}.nmrd`));
      res.status(201).json({
        message: 'Success: diagram created',
        id: dbResponse.diagram_id,
      });
    } else {
      if (req.file) fs.unlinkSync(req.file.path);
      throw new Error(
        'Something went wrong with database, maybe Id already exists??',
      );
    }
  } catch (error) {
    if (req.file) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    next(error);
  }
};

export const getDiagramFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ message: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;
    const dbResponse = await DiagramRepository.loadById(resource);
    if (!dbResponse) {
      res.status(404).json({ message: 'Diagram not found in database' });
      return;
    }

    const filePath = path.join(STORAGE_DIR, `${resource}.nmrd`);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'Diagram file not found on disk' });
    }
  } catch (error) {
    next(error);
  }
};

export const getDateModified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ message: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;
    const dbResponse = await DiagramRepository.getModifiedById(resource);
    if (dbResponse) {
      res.status(200).json(dbResponse);
    } else {
      res.status(404).json({ message: 'Diagram not found' });
    }
  } catch (error) {
    next(error);
  }
};
