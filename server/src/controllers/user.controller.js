import { User } from "../models/user.model.js";

const getMyProfile = async(req, res, next)=>{
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user){
            return res.status(404).json({
                success: false,
                messsage: "User not found"
            })
        }

        return res.status(200).json({
            success: false,
            messsage: "Profile retrieved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })
    } catch (error) {
        next(error)
    }
}

export {getMyProfile}