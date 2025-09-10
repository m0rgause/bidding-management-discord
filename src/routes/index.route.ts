import auth from "./auth.route";
import { Router } from "express";
const router = Router();

router.use("/auth", auth);

export default router;
