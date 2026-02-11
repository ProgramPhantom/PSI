import type { Request, Response, NextFunction } from 'express';

// Create an item
export const getHelloWorld = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json("Hello World");
  } catch (error) {
    next(error);
  }
};