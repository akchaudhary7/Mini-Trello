import {Router} from 'express'
import { registerUser, loginUser } from '../controllers/auth.controller.js';


const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/home").get((req, res)=>{
    res.status(200).json({
        success: true,
        message: "Api working auth router",
        time: new Date().toLocaleDateString()
    })
})


export default router