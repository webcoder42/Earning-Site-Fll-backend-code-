import mongoose from "mongoose";
import moment from "moment";
import UserAdsModel from "../models/UserAdsModel.js";
import AdvertisementModel from "../models/AdvertisementModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js";

// Create user ad interaction
// Create user ad interaction
export const createUserAdsController = async (req, res) => {
  try {
    const { adId, viewedSeconds } = req.body;
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

    // Get the package details and daily ad limit
    const packageDetails = await PackagesModel.findById(
      activePurchase.packagesId
    );
    if (!packageDetails) {
      return res.status(400).json({ message: "Package details not found." });
    }

    const dailyAdLimit = packageDetails.numOfAds || 20; // Default daily limit if not defined
    const earningRate = packageDetails.earningRate;

    // Get today's date to filter ads viewed today
    const startOfDay = moment().startOf("day").toDate();

    // Count ads watched today by the user
    const adsViewedToday = await UserAdsModel.countDocuments({
      userId,
      viewedDate: { $gte: startOfDay },
    });

    // Check if user has viewed the ad for the required duration
    const adDetails = await AdvertisementModel.findById(adId);
    if (!adDetails) {
      return res.status(400).json({ message: "Advertisement not found." });
    }

    const requiredDuration = adDetails.duration;
    if (viewedSeconds < requiredDuration) {
      return res.status(400).json({
        message: `You need to watch the ad for at least ${requiredDuration} seconds.`,
      });
    }

    // Calculate earnings or deductions based on daily limit
    let earnedAmount = earningRate;

    if (adsViewedToday >= dailyAdLimit) {
      // Only deduct earningRate amount once for extra views
      earnedAmount = -earningRate;
    }

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
      message:
        adsViewedToday >= dailyAdLimit
          ? "Ad viewed, but earnings deducted due to exceeding daily limit."
          : "Ad viewed and earnings updated successfully.",
      userAd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Other controller functions remain the same

// Get user total ads viewed today
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
/*export const getUserTotalAdsViewed = async (req, res) => {
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
};*/

export const adminGetAds = async (req, res) => {
  try {
    // Accept email as a query parameter
    const { email } = req.query;

    // If email is provided, find user by email
    let user;
    if (email) {
      user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // If no email is provided, use userId from params
      const { userId } = req.params;
      user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Fetch ad interactions for the specific user
    const adInteractions = await UserAdsModel.find({ userId: user._id });

    if (adInteractions.length === 0) {
      return res.status(404).json({
        message: "No ad interactions found for this user.",
        totalAdsWatched: 0,
        totalEarnings: 0,
      });
    }

    // Calculate total ads watched and total earnings from those ads
    const totalAdsWatched = adInteractions.length;
    const totalEarnings = adInteractions.reduce(
      (sum, interaction) => sum + interaction.earnedAmount,
      0
    );

    // Send detailed response back to admin
    res.status(200).json({
      success: true,
      message: "User ad interactions retrieved successfully",
      user: {
        username: user.username,
        email: user.email,
      },
      totalAdsWatched,
      totalEarnings,
      adDetails: adInteractions.map((interaction) => ({
        adId: interaction.adId,
        viewedSeconds: interaction.viewedSeconds,
        earnedAmount: interaction.earnedAmount,
        viewedDate: interaction.viewedDate,
      })),
    });
  } catch (error) {
    console.error("Error in adminGetAds:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
