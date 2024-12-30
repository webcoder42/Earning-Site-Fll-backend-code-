// routes/messageRoutes.js

import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  checkAndSendMessageForApprovedUser,
  createMessage,
  getMessageForUser,
} from "../Controller/MessageController.js";

const router = express.Router();

// Admin route to create a message
router.post("/create-message", requireSignIn, isAdmin, createMessage);

router.get("/get-message", requireSignIn, getMessageForUser);

// Route to auto-send message if withdrawal status is approved
router.get(
  "/check-and-send-message",
  requireSignIn,
  checkAndSendMessageForApprovedUser
);

export default router;
