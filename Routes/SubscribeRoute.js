import express from "express";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";
import {
  addLink,
  deleteLink,
  getLink,
} from "./../Controller/SubscribeController.js";

const router = express.Router();

// Add a new link (Admin only)
router.post("/create-link", requireSignIn, isAdmin, addLink);

// Get all links
router.get("/get-link", requireSignIn, getLink);

// Delete a link (Admin only)
router.delete("/delete-link", requireSignIn, isAdmin, deleteLink);

export default router;
