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
import authRouter from "./routes/auth.routes.js"
import errorHandler from './middlewares/error.middleware.js';

app.get("/", (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Api working",
        date: new Date().toLocaleDateString()
    })
})
app.use("/api/auth", authRouter)

app.use(errorHandler)

export {app}