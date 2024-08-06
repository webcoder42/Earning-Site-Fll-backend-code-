import mongoose from "mongoose";
import moment from "moment";
import UserAdsModel from "../models/UserAdsModel.js";
import AdvertisementModel from "../models/AdvertisementModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js";

// Create user ad interaction
export const createUserAdsController = async (req, res) => {
  try {
    const { adId, viewedSeconds } = req.body;
    const userId = req.user._id; // userId directly from req.user

    // Check if user has an active package purchase
    const activePurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    });
    if (!activePurchase) {
      return res
        .status(400)
        .json({ message: "No active package found for the user." });
    }

    // Get the package details
    const packageDetails = await PackagesModel.findById(
      activePurchase.packagesId
    );
    if (!packageDetails) {
      return res.status(400).json({ message: "Package details not found." });
    }

    // Get the advertisement details
    const adDetails = await AdvertisementModel.findById(adId);
    if (!adDetails) {
      return res.status(400).json({ message: "Advertisement not found." });
    }

    // Check if user has viewed the ad for the required duration
    const requiredDuration = adDetails.duration;
    if (viewedSeconds < requiredDuration) {
      return res.status(400).json({
        message: `You need to watch the ad for at least ${requiredDuration} seconds.`,
      });
    }

    // Check if the user has already viewed this ad within the last 24 hours
    /* const alreadyViewed = await UserAdsModel.findOne({
      userId,
      adId,
      viewedDate: {
        $gte: moment().subtract(24, "hours").toDate(),
      },
    });
    if (alreadyViewed) {
      return res.status(400).json({
        message: "You have already watched this ad within the last 24 hours.",
      });
    }*/

    // Calculate the earnings
    const earnedAmount = packageDetails.earningRate;

    // Create a new UserAds document
    const userAd = new UserAdsModel({
      userId,
      adId,
      viewedSeconds,
      earnedAmount,
      viewedDate: Date.now(),
    });
    await userAd.save();

    // Update user's earnings
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        earnings: earnedAmount,
        TotalEarnings: earnedAmount,
      },
    });

    res.status(200).json({
      message: "Ad viewed and earnings updated successfully.",
      userAd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all ads for a single user based on their package
export const getAllAdsForSingleUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has an active package purchase
    const activePurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    });

    if (!activePurchase) {
      return res
        .status(400)
        .json({ message: "No active package found for the user." });
    }

    // Get the package details
    const packageDetails = await PackagesModel.findById(
      activePurchase.packagesId
    );
    if (!packageDetails) {
      return res.status(400).json({ message: "Package details not found." });
    }

    // Get the number of ads allowed for the package
    const numOfAds = packageDetails.numOfAds;

    // Fetch the ads
    const ads = await AdvertisementModel.find().limit(numOfAds);

    res.status(200).json({
      success: true,
      totalads: ads.length,
      message: "Get all single user ads",
      ads,
    });
  } catch (error) {
    console.error("Error fetching user ads:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all user ads interactions
export const getUserAdsInteractions = async (req, res) => {
  try {
    const ads = await AdvertisementModel.find();
    return res.status(200).json({
      success: true,
      totalads: ads.length,
      message: "Get all ads",
      ads,
    });
  } catch (error) {
    console.error("Error in getAllAds:", error); // Log the error
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get total earnings from ads
export const getUserEarningsFromAds = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the authenticated user ID is available in req.user

    // Calculate the total earnings from UserAds documents
    const totalEarnings = await UserAdsModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$earnedAmount" } } },
    ]);

    const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;

    res.status(200).json({
      message: "Total earnings from ads retrieved successfully.",
      totalEarnings: earnings,
    });
  } catch (error) {
    console.error("Error in getUserEarningsFromAds:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user total ads viewed today
// Get total ads viewed by the user
export const getUserTotalAdsViewed = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate the total number of ads viewed by the user
    const totalAdsViewed = await UserAdsModel.countDocuments({ userId });

    // Get the user's active package purchase
    const activePurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    }).populate("packagesId");

    if (!activePurchase) {
      return res.status(400).json({
        message:
          "No active package found. Please purchase a package to view ads.",
      });
    }

    const packageDetails = activePurchase.packagesId;
    const dailyAdLimit = packageDetails.numOfAds || 20; // Default to 20 if not defined

    // Calculate the number of ads viewed in the past 24 hours
    const startOfDay = moment().startOf("day").toDate();
    const adsViewedToday = await UserAdsModel.countDocuments({
      userId,
      viewedDate: { $gte: startOfDay },
    });

    const remainingAdsToday = Math.max(dailyAdLimit - adsViewedToday, 0);

    res.status(200).json({
      totalAdsViewed,
      adsViewedToday,
      remainingAdsToday,
    });
  } catch (error) {
    console.error("Error in getUserTotalAdsViewed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
