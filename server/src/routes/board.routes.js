import { Router } from "express";

import authenticate from "../middlewares/auth.middleware.js";
import loadBoardMembership from "../middlewares/loadBoardMembership.middleware.js";
import requireOwner from "../middlewares/requireOwner.middleware.js";

import {
  createBoard,
  listMyBoards,
  renameBoard,
  deleteBoard,
  getOneBoard,
} from "../controllers/board.controller.js";

const router = Router();

router.post("/", authenticate, createBoard);

router.get("/", authenticate, listMyBoards);

router.get("/:boardId", authenticate, loadBoardMembership, getOneBoard);

router.patch(
  "/:boardId",
  authenticate,
  loadBoardMembership,
  requireOwner,
  renameBoard,
);

router.delete(
  "/:boardId",
  authenticate,
  loadBoardMembership,
  requireOwner,
  deleteBoard,
);

export default router;
