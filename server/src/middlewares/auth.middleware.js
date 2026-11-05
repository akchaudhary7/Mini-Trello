import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

const authenticate = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader){
            res.status(401).json({
                success: false,
                message: "Access token is required"
            })
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme?.toLowerCase() !== "bearer" || !token){
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (
            typeof decoded !== "object" ||
            typeof decoded.userId !== "string"
        ){
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            })
        }

        const user= await User.findById(decoded?.userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            })
        }

        req.user = {
            userId: decoded.userId
        }

        next();
    } catch (error) {
        return res.status(401).json({
                success: false,
                message: "Invalid or expired access token"
            })
    }
}


export default authenticate