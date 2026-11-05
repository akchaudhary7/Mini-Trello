import mongoose, { Schema } from "mongoose";

const cardSchema = new Schema({
  board: {
    type: Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  list: {
    type: Schema.Types.ObjectId,
    ref: "List",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true
  },
  position: {
    type: Number,
    required: true
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", null],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {timestamps: true});

cardSchema.index({list: 1, position:1})

cardSchema.index({board:1, position: 1})

export const Card = mongoose.model("Card", cardSchema)

