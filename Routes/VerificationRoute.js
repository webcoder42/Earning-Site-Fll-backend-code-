import express from "express";
import {
  deleteVerificationData,
  editVerificationData,
  fillVerificationData,
  getAllVerificationData,
  getUserVerificationData,
  getVerifiedVerificationData,
  updateVerificationStatus,
} from "../Controller/VerificationController.js";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";

const router = express.Router();

// User fills verification data
router.post("/submit", requireSignIn, fillVerificationData);

// Get logged-in user's verification data
router.get("/user", requireSignIn, getUserVerificationData);

// Admin gets all verification data
router.get("/admin/all", requireSignIn, isAdmin, getAllVerificationData);

// Admin updates verification status
router.put(
  "/admin/update/:id",
  requireSignIn,
  isAdmin,
  updateVerificationStatus
);
router.put("/admin/edit/:id", requireSignIn, isAdmin, editVerificationData);
router.delete(
  "/admin/delete/:id",
  requireSignIn,
  isAdmin,
  deleteVerificationData
);

router.get("/verified-user", requireSignIn, getVerifiedVerificationData);
export default router;
