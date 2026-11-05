import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes
import authRoutes from "./routes/auth.routes.js"
import errorHandler from './middlewares/error.middleware.js';
import protectedRoutes from "./routes/protected.routes.js";
import userRoutes from "./routes/user.routes.js"

app.get("/", (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Api working",
        date: new Date().toLocaleDateString()
    })
})
app.use("/api/auth", authRoutes)
app.use("/api/protected", protectedRoutes);
app.use("/api/users", userRoutes)

app.use(errorHandler)

export {app}