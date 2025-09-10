import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const userRegistrationSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
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
      const jsonError = JSON.parse(result.error.message);
      return res.status(400).json({ errors: jsonError[0].message });
    }
    req.body = result.data;
    next();
  };
};
