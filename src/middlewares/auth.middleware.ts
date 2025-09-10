import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { JWTPayload, AuthenticatedRequest } from "../types";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.sendStatus(403);
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as JWTPayload["role"],
    };
    next();
  } catch (error) {
    res.sendStatus(403);
  }
};
