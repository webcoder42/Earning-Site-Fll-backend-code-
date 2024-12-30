import mongoose from "mongoose";
import moment from "moment";
import UserModel from "../models/UserModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import LongEarnModel from "../models/LongEarnModel.js";
import UserLongEarnModel from "../models/UserLongEarnModel.js";
import PackagesModel from "../models/PackagesModel.js";

// Create user ad interaction
export const createLongAdsController = async (req, res) => {
  try {
    const { adId, code, comment } = req.body;
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

    // Get today's date to filter ads viewed today
    const startOfDay = moment().startOf("day").toDate();

    // Count ads watched today by the user
    const adsViewedToday = await UserLongEarnModel.countDocuments({
      userId,
      viewedDate: { $gte: startOfDay },
    });

    // Ensure the user can only watch one ad per day
    if (adsViewedToday >= 1) {
      return res
        .status(400)
        .json({ message: "You have already watched an ad today." });
    }

    // Get the ad details from LongEarnModel
    const adDetails = await LongEarnModel.findById(adId);
    if (!adDetails) {
      return res.status(400).json({ message: "Advertisement not found." });
    }

    // Validate the code entered by the user
    if (adDetails.code !== code) {
      return res
        .status(400)
        .json({ message: "Invalid code. Please try again." });
    }

    // Create the user ad interaction
    const userAd = new UserLongEarnModel({
      userId,
      packagePurchaseId: activePurchase._id,
      packageId: packageDetails._id,
      LongEarnAdsId: adDetails._id,
      code,
      comment,
      earnMoney: packageDetails.earningRate * 10, // Multiply earning rate by 10
    });

    await userAd.save();

    // Update user's earnings
    const earningAmount = packageDetails.earningRate * 10; // Calculate earnings
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        earnings: earningAmount,
        TotalEarnings: earningAmount,
      },
    });

    res
      .status(200)
      .json({ message: "Ad watched successfully. Earnings updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all ads for the user based on their active package

// Get all ads for the user (from LongEarnModel)
export const getSingleUserAds = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user's active package to check eligibility for viewing ads
    const activePurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    });
    if (!activePurchase) {
      return res.status(400).json({ message: "No active package found." });
    }

    // Get the package details
    const packageDetails = await PackagesModel.findById(
      activePurchase.packagesId
    );
    if (!packageDetails) {
      return res.status(400).json({ message: "Package details not found." });
    }

    // Fetch all ads from the LongEarnModel
    const allAds = await LongEarnModel.find({});
    if (!allAds || allAds.length === 0) {
      return res.status(400).json({ message: "No ads available." });
    }

    // Respond with the list of ads
    res.status(200).json({
      success: true,
      ads: allAds,
      message: "All ads retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching all ads:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getUserEarning = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate the total earnings from UserLongEarnModel documents
    const totalEarnings = await UserLongEarnModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$earnMoney" } } },
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

//admin get longearn

// Get user details by email (including ads and earnings)
export const getUserDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch all ads interacted by the user
    const userAds = await UserLongEarnModel.find({ userId: user._id })
      .populate("LongEarnAdsId", "adName earnMoney submittedAt") // Assuming the LongEarnAdsId references the ad details
      .exec();

    // Calculate total earnings from ads
    const totalEarnings = userAds.reduce((acc, ad) => acc + ad.earnMoney, 0);

    // Total number of ads submitted by the user
    const totalAdsSubmitted = userAds.length;

    // Prepare the data to return
    const userDetails = {
      user: {
        email: user.email,
        totalEarnings,
        totalAdsSubmitted,
        ads: userAds.map((ad) => ({
          adName: ad.LongEarnAdsId.LongEarnAdsId,
          earnMoney: ad.earnMoney,
          submittedAt: ad.submittedAt,
        })),
      },
    };

    res.status(200).json({
      message: "User details fetched successfully.",
      userDetails,
    });
  } catch (error) {
    console.error("Error in getUserDetailsByEmail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
