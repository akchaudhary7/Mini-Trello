import mongoose from "mongoose";
import { User } from "./user.model.js";


const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revokedAt: {
        type: Date,
        default: null
    },
    replacedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RefreshToken",
        default: null
    }

}, {
    timestamps:{
        createdAt: true,
        updatedAt: false
    }
});

refreshTokenSchema.index(
    {expiresAt: 1},
    {expireAfterSeconds: 0}
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

export default RefreshToken