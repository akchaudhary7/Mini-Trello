import mongoose, {Schema} from 'mongoose'

const listSchema = new Schema({
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    position : {
        type: Number,
        required: true
    }
}, {timestamps: true})

export const List = mongoose.model("List", listSchema)