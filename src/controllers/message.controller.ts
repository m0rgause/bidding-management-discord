import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types";

export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { message: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if project already has a message
    if (project.message) {
      return res.status(400).json({ error: "Project already has a message" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        projectId,
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Message created successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: "Failed to create message" });
  }
};

export const getMessageByProjectId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    const message = await prisma.message.findUnique({
      where: { projectId },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
};

export const updateMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    const message = await prisma.message.update({
      where: { projectId },
      data: { content },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    res.json({ message: "Message updated successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
};

export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    await prisma.message.delete({
      where: { projectId },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};
