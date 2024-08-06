import express from "express";
import { requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createUserAdsController,
  getUserAdsInteractions,
  getUserEarningsFromAds,
  getAllAdsForSingleUser,
  getUserTotalAdsViewed,
} from "./../Controller/UserAdsController.js";

const router = express.Router();

// Create user ad interaction
router.post("/create-user-ads", requireSignIn, createUserAdsController);

// Get all user ads interactions
router.get("/user-all-ads", requireSignIn, getUserAdsInteractions);

// Get total earnings from ads
router.get("/user-ads-earnings", requireSignIn, getUserEarningsFromAds);

// Get user total ads viewed today
// Get user total ads viewed
router.get("/user-total-ads-viewed", requireSignIn, getUserTotalAdsViewed);

// Get all ads for a single user based on their package
router.get("/user-ads", requireSignIn, getAllAdsForSingleUser);

export default router;
