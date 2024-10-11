import express from "express";
import { requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  claimTaskController,
  getTasksByUserCurrency,
} from "../Controller/UserTaskController.js";
const router = express.Router();

// POST route for claiming a task
router.post("/claim-task", requireSignIn, claimTaskController);

router.get("/get", requireSignIn, getTasksByUserCurrency);

export default router;
