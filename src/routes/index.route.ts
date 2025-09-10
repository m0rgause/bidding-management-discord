import auth from "./auth.route";
import projects from "./project.route";
import { Router } from "express";
const router = Router();

router.use("/auth", auth);
router.use("/projects", projects);

export default router;
