import type { Request, Response, NextFunction } from 'express';
import { DiagramRepository } from '../repositories/DiagramRepository.js';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';
import type { JsonObject } from '../db/db.js';

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
    //TODO auth check
    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;

    const deleteResponse = await DiagramRepository.deleteById(resource);
    if (deleteResponse.numDeletedRows > 0) {
        res.status(200).json({message: `Deleted diagram with Id: ${resource}`});
    } else {
        res.status(404).json({error: "Diagram not found"})
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
    //TODO auth check
    //TODO copy logic
    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;

    const ownerData = await DiagramRepository.getOwnerById(resource);

    if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
        res.status(400).json({error: "Body must be a JSON object"})
        return;
    }

    if (ownerData) {
      const updateResponse = await DiagramRepository.saveById(resource, req.body as JsonObject);
      if (updateResponse.numUpdatedRows > 0) {
        res.status(200).json({message: `Saved diagram with Id: ${resource}`});
      } else {
        throw new Error("No rows updated for an Id that was found??? No clue mate.")
      }
    } else {
        //diagram does not exist
        res.status(404).json({error: "Diagram not found"})
    }
  } catch (error) {
    next(error);
  }
};

export const postCreateDiagram = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //create a blank diagram belonging to the logged in user
    const id = uuidv7();
    const result = CreateDiagramSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }
    const { name } = result.data;
    
    const dbResponse = await DiagramRepository.createDiagram(
      id,
      new Date(),
      '', //TODO correct auth
      name,
    );
    if (dbResponse) {
        res.status(201).json({message: "Success: diagram created", id: dbResponse.diagram_id})
    } else {
        throw new Error("Something went wrong with database, maybe Id already exists??");
    }
  } catch (error) {
    next(error);
  }
};

export const getLoadDiagram = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = IdSchema.safeParse(req.params.diagramId);
    if (!result.success) {
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;
    const dbResponse = await DiagramRepository.loadById(resource);
    if (dbResponse) {
      res.status(200).json(dbResponse);
    } else {
      res.status(404).json({ error: 'Diagram not found' });
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
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }
    const resource = result.data;
    const dbResponse = await DiagramRepository.getModifiedById(resource);
    if (dbResponse) {
        res.status(200).json(dbResponse);
    } else {
        res.status(400).json({error: "Diagram not found"})
    }
  } catch (error) {
    next(error);
  }
};
