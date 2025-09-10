import { register, login, me } from "../controllers/auth.controller";
import { Router } from "express";
import {
  validateBody,
  userLoginSchema,
  userRegistrationSchema,
} from "../middlewares/validation.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.post("/register", validateBody(userRegistrationSchema), register);
router.post("/login", validateBody(userLoginSchema), login);
router.get("/me", authenticateToken, me);

export default router;
