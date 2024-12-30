import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createLongAdsController,
  getSingleUserAds,
  getUserDetailsByEmail,
  getUserEarning,
} from "../Controller/UserLongEarnController.js";

const router = express.Router();

// Create user ad interaction
router.post("/create", requireSignIn, createLongAdsController);

// Get all user ads interactions
//router.get("/user-all-ads", requireSignIn, getUserAdsInteractions);

// Get total earnings from ads
router.get("/user-ads-earnings", requireSignIn, getUserEarning);

// Get admin total ads viewed today
//router.get("/admin-get", requireSignIn, isAdmin, adminGetAds);

// Get user total ads viewed
//router.get("/user-total-ads-viewed", requireSignIn, getUserTotalAdsViewed);

// Get all ads for a single user based on their package
router.get("/user-ads", requireSignIn, getSingleUserAds);

//admin get
router.get(
  "/user-details/:email",
  requireSignIn,
  isAdmin,
  getUserDetailsByEmail
);

export default router;
