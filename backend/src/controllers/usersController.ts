import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { login } from '../services/loginService.js';
import { DiagramRepository } from '../repositories/DiagramRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
const LoginValidationSchema = z.object(
  {
    clientId: z.string().min(1),
    credential: z.string().min(1),
    select_by: z.string()
  }
)
export type loginValidationData = z.infer<typeof LoginValidationSchema>;

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const formData = LoginValidationSchema.safeParse(req.body)
    if (formData.success) {
      const loginResponse = await login(formData.data, req.session)      
      res.status(loginResponse.code).json({message: loginResponse.message})
    } else {
      res.status(400).json({message: z.treeifyError(formData.error)})
    }

  } catch (error) {
    next(error);
  }
};


export const getDiagrams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.authenticated !== true) {
      res.status(401).json({message: "Authentication required"})
      return;
    }
    //gsub must exist if authenticated is strictly true, hence !
    const usersDiagrams = await DiagramRepository.getDiagramsByOwner(req.session.gsub!)
    res.status(200).json({diagrams: usersDiagrams})
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ user: null, error: "Not authenticated" });
  }

  const user = await UserRepository.getUserById(req.session.gsub ?? "");

  if (!user) {
    return res.status(401).json({ user: "null", error: "User does not exist" });
  }

  res.status(200).json({
      ...user
  });
}