import { Board } from "../models/board.model.js";

const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body ?? {};

    console.log("Request body:", req.body);
    console.log("Title:", title);
    console.log("Title type:", typeof title);

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Board title is required",
      });
    }

    const userId = req.user.userId;

    const board = await Board.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      owner: userId,
      members: [
        {
          user: userId,
          role: "owner",
        },
      ],
    });

    if (!board) {
      return res.status(500).json({
        success: false,
        message: "Board creation failed",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

const listMyBoards = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const boards = await Board.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    }).sort({ updated: -1 });

    if (!boards) {
      return res.status(500).json({
        success: false,
        message: "Board not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: boards.length,
      data: boards,
    });
  } catch (error) {
    next(error);
  }
};

const renameBoard = async (req, res, next) => {
  try {
    const { title } = req.body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Board title is required",
      });
    }

    const board = await Board.findByIdAndUpdate(
        req.board._id,
        {
            $set: {
                title: title.trim()
            },
        },
        {
            new: true,
            runValidators: true
        }
    );

    return res.status(200).json({
        success: true,
        message: "Board renamed successfully",
        data: board
    })
  } catch (error) {
    next(error)
  }
};

const deleteBoard = async (req, res, next)=>{
    try {
        const board = await Board.findByIdAndDelete(req.board._id)

        if (!board){
            return res.status(400).json({
                success: false,
                message: "Board deletion failed"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Board deleted successfully",
            data: board
        })

    } catch (error) {
        next(error)
    }
}


export { createBoard, listMyBoards, renameBoard, deleteBoard };
