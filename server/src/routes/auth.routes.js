import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logutUser,
  logoutAllUsers,
} from "../controllers/auth.controller.js";

import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.post("/refresh", refreshAccessToken);

router.post("/logout", logutUser);

router.post("/logout-all", authenticate, logoutAllUsers);

export default router;
