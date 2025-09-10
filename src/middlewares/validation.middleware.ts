import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const userRegistrationSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
});

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const validateBody = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.message });
    }
    req.body = result.data;
    next();
  };
};
