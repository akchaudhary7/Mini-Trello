import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    }
}, {timestamps: true});


const removePasswordHash = (doc, ret) =>{
    delete ret.passwordHash;
    return ret;
};

userSchema.set("toJSON", {
    transform: removePasswordHash
});

userSchema.set("toObject", {
    transform: removePasswordHash
})


export const User = mongoose.model("User", userSchema)
