import LevelCreateModel from "../models/LevelCreateModel.js";
import UserLevelModel from "../models/UserLevelModel.js";
import UserModel from "../models/UserModel.js";
import VerificationModel from "../models/VerificationModel.js";
import PackagePurchaseModel from "./../models/PackagePurchaseModel.js";

//get

// Controller to get levels by user currency
export const getLevelsByCurrency = async (req, res) => {
  try {
    // Step 1: Get logged-in user from `req.user` (set by authMiddleware)
    const userId = req.user._id; // Assuming authMiddleware sets `req.user`
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Fetch levels matching user's currency
    const userCurrency = user.currency;
    const levels = await LevelCreateModel.find({ currency: userCurrency });

    if (!levels || levels.length === 0) {
      return res
        .status(404)
        .json({ message: `No levels found for currency ${userCurrency}` });
    }

    // Step 3: Return the levels
    res.status(200).json({
      message: `Levels retrieved successfully for currency ${userCurrency}`,
      levels,
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to unlock levels for a user
export const unlockLevel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { levelId } = req.body;

    const user = await UserModel.findById(userId);
    const level = await LevelCreateModel.findById(levelId);

    if (!user || !level) {
      return res.status(404).json({ message: "User or level not found." });
    }

    const verification = await VerificationModel.findOne({ userId });
    if (!verification || verification.verification !== "verify") {
      return res.status(400).json({
        message: "User must be verified to unlock levels.",
      });
    }

    if (user.TotalEarnings < level.MinAmount) {
      return res
        .status(400)
        .json({ message: "Insufficient earnings to unlock this level." });
    }

    // Calculate active referrals and purchases
    /* const activeReferrals = await UserModel.countDocuments({
      referredBy: user.referralCode,
    });

    const activePurchases = await PackagePurchaseModel.countDocuments({
      referrer: user._id,
      packageStatus: "Active",
    });

    console.log("Active referrals and purchases:", {
      activeReferrals,
      activePurchases,
      MinActiveRef: level.MinActiveRef,
    });

    const totalActiveRefs = activeReferrals + activePurchases;

    if (totalActiveRefs < level.MinActiveRef) {
      return res.status(400).json({
        message: "Minimum active referrals requirement not met.",
      });
    }
      */

    const existingLevel = await UserLevelModel.findOne({ userId });

    if (existingLevel) {
      existingLevel.levelId = levelId;
      existingLevel.status = "Eligible";
      existingLevel.upgradeCommission = level.upgradeCommision;
      existingLevel.upgradeDate = new Date();
      await existingLevel.save();
    } else {
      const newUserLevel = new UserLevelModel({
        userId: userId,
        levelId: levelId,
        status: "Eligible",
        upgradeCommission: level.upgradeCommision,
        upgradeDate: new Date(),
      });
      await newUserLevel.save();
    }

    user.TotalEarnings += level.upgradeCommision;
    user.earnings += level.upgradeCommision;
    await user.save();

    res.status(200).json({
      message: "Level unlocked successfully!",
      levelDetails: existingLevel || newUserLevel,
    });
  } catch (error) {
    console.error("Error unlocking level:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
