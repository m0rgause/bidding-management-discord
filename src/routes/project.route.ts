import { Router } from "express";
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import {
  createMessage,
  getMessageByProjectId,
  updateMessage,
  deleteMessage,
} from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Project routes
router.get("/", getAllProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Message routes for projects
router.post("/:projectId/message", createMessage);
router.get("/:projectId/message", getMessageByProjectId);
router.put("/:projectId/message", updateMessage);
router.delete("/:projectId/message", deleteMessage);

export default router;
