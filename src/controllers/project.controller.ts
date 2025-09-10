import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types";

export const getAllProjects = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const projects = await prisma.project.findMany({
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
        message: true,
      },
      where: {
        userId: req.user?.userId,
      },
    });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, description, budget, priced, isOpenBidding } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget,
        priced,
        isOpenBidding: isOpenBidding || false,
        userId,
      },
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
    });

    // Emit real-time notification
    if (global.socketService) {
      global.socketService.broadcastNotification("new_project", {
        id: project.id,
        title: project.title,
        budget: project.budget,
        username: project.user.username,
        isOpenBidding: project.isOpenBidding,
      });
    }

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
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
        message: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.userId;

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (existingProject.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own projects" });
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
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
    });

    // Emit real-time notification for project update
    if (global.socketService) {
      global.socketService.broadcastNotification("project_update", {
        id: project.id,
        title: project.title,
        budget: project.budget,
        priced: project.priced,
        isOpenBidding: project.isOpenBidding,
        isCompleted: project.isCompleted,
        username: project.user.username,
      });
    }

    res.json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (existingProject.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own projects" });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
};
