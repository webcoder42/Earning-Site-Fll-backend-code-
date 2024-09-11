import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createTaskController,
  deleteTaskController,
  getTaskController,
} from "../Controller/TaskController.js";

const router = express.Router();

// Add a new link (Admin only)
router.post("/create-task", requireSignIn, isAdmin, createTaskController);

//get
router.get("/get-task", requireSignIn, isAdmin, getTaskController);

//delete
router.delete("/delete-task/:id", requireSignIn, isAdmin, deleteTaskController);

export default router;
