import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { getMyProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, getMyProfile);

export default router