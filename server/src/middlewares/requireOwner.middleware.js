const requireOwner = (req, res, next) => {
    if (req.boardRole !== "owner"){
        return res.status(403).json({
            success: false,
            message: "Only the board owner can perform this action"
        });
    }
    next();
}

export default requireOwner