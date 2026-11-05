import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";


const registerUser = async (req, res, next) =>{
    try {
        const {name, email, password} = req.body ?? {};

        if (
            typeof name !== 'string' || 
            typeof email !== 'string' || 
            typeof password !== 'string' || 
            !name.trim() ||
            !email.trim() ||
            !password
        ){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)){
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            })
        }

        if(password.length < 8){
            return res.status(400).json({
                success:false,
                message:  "Password must be at least 8 characters long"
            })
        }

        if (Buffer.byteLength(password, "utf-8") > 72 ){
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes"
            })
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        })

        if (existingUser){
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        })

        if (!user){
            res.status(500).json({
                success: false,
                message: "Something went wrong while registering the user"
            })
        }

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        next(error)
    }
}

const loginUser = async (req, res) =>{
    try {
        const {email, password} = req.body ?? {}

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
    ){
        return res.status(400).json({
            success: false,
            message: "Eamil and password is required to login"
        })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+passwordHash")

    if (!user){
         return res.status(401).json({
            success: false,
            message: "Invalid user credentials",
        })
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordCorrect){
        return res.status(401).json({
            success: false,
            message: "Invalid user credentials",
        })
    }

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    });
    } catch (error) {
        next(error)
    }

}


export {registerUser, loginUser}