import {Router} from 'express'
import { registerUser, loginUser, refreshAccessToken } from '../controllers/auth.controller.js';


const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.post("/refresh", refreshAccessToken)


export default router