import express from "express";

import {
  createLevel,
  deleteLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
} from "../Controller/LevelCreateController.js";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
const router = express.Router();

// Route to create a level
router.post("/create", requireSignIn, isAdmin, createLevel);

// Route to get all levels
router.get("/get", requireSignIn, getAllLevels);

// Route to get a level by ID
router.get("/get/:id", requireSignIn, isAdmin, getLevelById);

// Route to update a level by ID
router.put("/update/:id", requireSignIn, isAdmin, updateLevel);

// Route to delete a level by ID
router.delete("/delete/:id", requireSignIn, isAdmin, deleteLevel);

export default router;
