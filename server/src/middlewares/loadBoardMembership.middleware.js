import mongoose from "mongoose";
import { Board } from "../models/board.model.js";

const loadBoardMembership = async(req, res, next) => {
    try {
        const {boardId} = req.params;

        const userId = req.user.userId;

        if(!mongoose.isValidObjectId(boardId)){
            return res.status(404).json({
                success: false,
                message: "Board not found"
            })
        }

        const board = await Board.findById(boardId);

        if (!board){
            return res.status(404).json({
                success: false,
                message: "Board not found"
            })
        }

        const membership = board.members.find(
            (member) => member.user.toString() === userId
        );

        if(!membership){
            return res.status(404).json({
                success: false,
                message: "Board not found"
            })
        }

        req.board = board;
        req.boardRole = membership.role;

        next();
    } catch (error) {
        next(error)
    }
}

export default loadBoardMembership