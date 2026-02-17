import type { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository.js';


export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await new Promise(() => {console.log("kys")});
  } catch (error) {
    next(error);
  }
};