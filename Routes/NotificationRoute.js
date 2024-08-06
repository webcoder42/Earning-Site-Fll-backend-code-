import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  addAnnouncement,
  deleteNotify,
  getNotify,
  putNotify,
} from "../Controller/NotificationController.js";

const router = express.Router();

// Add a new announcement (Admin only)
router.post("/add", requireSignIn, isAdmin, addAnnouncement);

router.get("/get-notify", requireSignIn, getNotify);

router.put("/put-notify", requireSignIn, putNotify);

router.delete("/delete-notify", requireSignIn, isAdmin, deleteNotify);

export default router;
