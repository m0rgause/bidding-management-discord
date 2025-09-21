import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { ApiResponse, AuthenticatedRequest, JWTPayload } from "../types";
import bcrypt from "bcrypt";
import { success } from "zod";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // checking email and username constraints
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      } as ApiResponse<null>);
    }
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already in use",
      } as ApiResponse<null>);
    }

    // create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    res.status(201).json({
      message: "User registered",
      data: user,
      success: true,
    } as ApiResponse<typeof user>);
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      success: false,
    } as ApiResponse<null>);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
        success: false,
      } as ApiResponse<null>);
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid email or password",
        success: false,
      } as ApiResponse<null>);
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      } as JWTPayload,
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      message: "Login successful",
      data: token,
      success: true,
    } as ApiResponse<string>);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Login failed", success: false } as ApiResponse<null>);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out", success: true } as ApiResponse<null>);
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ error: "Unauthorized", success: false } as ApiResponse<null>);
  }
  res.json({ data: user, success: true } as ApiResponse<typeof user>);
};
