import type { Request, Response, NextFunction } from 'express';

// Create an item
export const listen = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(JSON.stringify(req, null, 4))
    res.status(200).json("Sigma");
  } catch (error) {
    next(error);
  }
};