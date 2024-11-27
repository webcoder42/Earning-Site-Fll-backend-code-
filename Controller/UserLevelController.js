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

    const existingLevel = await UserLevelModel.findOne({ userId, levelId });

    if (existingLevel) {
      return res
        .status(400)
        .json({ message: "You have already unlocked this level." });
    }

    // Proceed with normal unlock logic...
    const newUserLevel = new UserLevelModel({
      userId: userId,
      levelId: levelId,
      status: "Eligible",
      upgradeCommission: level.upgradeCommision,
      upgradeDate: new Date(),
    });
    await newUserLevel.save();

    user.TotalEarnings += level.upgradeCommision;
    user.earnings += level.upgradeCommision;
    await user.save();

    res.status(200).json({
      message: "Level unlocked successfully.",
      levelDetails: newUserLevel,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//get currect active level
// Controller to get the current active level for a user
export const getCurrentUserLevel = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming authMiddleware sets `req.user`

    const userLevel = await UserLevelModel.findOne({ userId })
      .populate("levelId") // Populate the levelId to get full level details
      .sort({ upgradeDate: -1 }); // Ensure the most recent level is fetched (if multiple levels exist)

    res.status(200).json({
      message: "User's current active level retrieved successfully.",
      levelDetails: userLevel,
    });
  } catch (error) {
    console.error("Error retrieving user level:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// 1. Controller to get current level and check monthly salary for the user
/*export const getSalaryForCurrentLevel = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's current level
    const userLevel = await UserLevelModel.findOne({ userId }).populate(
      "levelId"
    );

    if (!userLevel) {
      return res
        .status(404)
        .json({ message: "No active level found for user." });
    }

    // Get monthly salary field from the level
    const currentLevel = userLevel.levelId;
    if (currentLevel && currentLevel.MonthlySalary === 0) {
      return res.status(200).json({ message: "Salary Not Available" });
    }

    // If salary > 0, return salary details
    res.status(200).json({
      message: "Salary details retrieved successfully.",
      monthlySalary:
        currentLevel.MonthlySalary > 0
          ? currentLevel.MonthlySalary
          : "Inactive",
    });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};/*

// 2. Controller to check salary increment on level unlock
/*export const checkSalaryOnLevelUnlock = async (req, res) => {
  try {
    const userId = req.user._id;
    const { levelId } = req.body;

    // Debugging: Log userId and levelId to ensure they are being passed correctly
    console.log("User ID: ", userId);
    console.log("Level ID: ", levelId);

    // Fetch the user and level
    const user = await UserModel.findById(userId);
    const level = await LevelCreateModel.findById(levelId);

    // Check if user and level exist
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    // Check if the level is already unlocked
    if (user.currentLevelId && user.currentLevelId.toString() === levelId) {
      return res.status(400).json({ message: "Level already unlocked." });
    }

    // Update user's level to the newly unlocked level
    user.currentLevelId = levelId;

    // Update salary and timer based on the newly unlocked level
    user.salaryAmount = level.MonthlySalary; // Update the salary amount
    const salaryDays = level.salarydays || 10; // Default salary days to 10 if not specified
    user.salaryTimer = new Date(); // Reset the salary timer to start now

    // Save user changes
    await user.save();

    return res.status(200).json({
      message: `Level unlocked successfully. Salary timer reset to ${salaryDays} days.`,
      salaryAmount: user.salaryAmount,
      salaryDays,
    });
  } catch (err) {
    console.error("Error unlocking level or checking salary:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};*/

/*export const claimSalary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if salary timer has been set
    if (!user.salaryTimer) {
      return res.status(400).json({ message: "Salary timer not started yet." });
    }

    // Calculate the timer completion
    const timerEndDate = new Date(user.salaryTimer);
    const currentLevel = await LevelCreateModel.findById(user.currentLevelId);
    const salaryDays = currentLevel.salarydays || 10; // Default 10 days
    timerEndDate.setDate(timerEndDate.getDate() + salaryDays);

    if (new Date() < timerEndDate) {
      const remainingTime = Math.ceil(
        (timerEndDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      return res.status(400).json({
        message: `Salary timer is still active. Please wait ${remainingTime} days.`,
        remainingTime,
      });
    }

    // Add salary to earnings and reset timer
    user.earnings += user.salaryAmount;
    user.TotalEarnings += user.salaryAmount;
    user.salaryTimer = new Date(); // Reset the timer for the next cycle

    await user.save();

    res.status(200).json({
      message: "Salary claimed successfully.",
      salaryAmount: user.salaryAmount,
      totalEarnings: user.TotalEarnings,
    });
  } catch (err) {
    console.error("Error claiming salary:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
*/
