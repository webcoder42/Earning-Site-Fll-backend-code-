import LevelCreateModel from "../models/LevelCreateModel.js";
import SalaryClaimModel from "../models/SalaryClaimModel.js";
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

    // Fetch the user, level, and verification status
    const user = await UserModel.findById(userId);
    const level = await LevelCreateModel.findById(levelId);

    // Check if user and level exist
    if (!user || !level) {
      return res.status(404).json({ message: "User or level not found." });
    }

    // Check if the user is verified
    const userVerification = await VerificationModel.findOne({ userId });
    if (!userVerification || userVerification.verification !== "verify") {
      return res.status(400).json({
        message: "User is not verified. Please verify your account first.",
      });
    }

    // Check if the user's total earnings are enough to unlock the level
    if (user.TotalEarnings < level.MinAmount) {
      return res.status(400).json({
        message: `You need at least ${level.MinAmount} in total earnings to unlock this level.`,
      });
    }

    // Check if the user has already unlocked the level
    const existingLevel = await UserLevelModel.findOne({ userId, levelId });
    if (existingLevel) {
      return res
        .status(400)
        .json({ message: "You have already unlocked this level." });
    }

    // Proceed with normal unlock logic
    const newUserLevel = new UserLevelModel({
      userId: userId,
      levelId: levelId,
      status: "Eligible",
      upgradeCommission: level.upgradeCommision,
      upgradeDate: new Date(),
    });
    await newUserLevel.save();

    // Update the user's earnings
    user.TotalEarnings += level.upgradeCommision;
    user.earnings += level.upgradeCommision;
    await user.save();

    // Return response
    res.status(200).json({
      message: "Level unlocked successfully.",
      levelDetails: newUserLevel,
    });
  } catch (err) {
    console.error(err);
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

export const getUserLevelByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Get email from route params

    // Fetch the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the user's level from the UserLevelModel
    const userLevel = await UserLevelModel.findOne({ userId: user._id })
      .populate("levelId") // Populate the levelId to get full level details
      .sort({ upgradeDate: -1 }); // Ensure we get the most recent level if there are multiple

    if (!userLevel) {
      return res.status(404).json({ message: "No level found for this user" });
    }

    // Fetch the level details
    const levelDetails = userLevel.levelId;

    // Return response
    res.status(200).json({
      message: "User's level details retrieved successfully",
      user: {
        name: user.name,
        email: user.email,
        levelId: userLevel.levelId,
      },
    });
  } catch (error) {
    console.error("Error retrieving user level:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSalaryForCurrentLevel = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the latest user level based on the most recent activation or creation date
    const userLevel = await UserLevelModel.findOne({ userId })
      .populate("levelId")
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    if (!userLevel) {
      return res
        .status(404)
        .json({ message: "No active or unlocked levels found for user." });
    }

    const currentLevel = userLevel.levelId;

    // Check eligibility based on the current level
    if (currentLevel && currentLevel.MonthlySalary === 0) {
      return res.status(200).json({ message: "Not Eligible for salary" });
    }

    if (currentLevel.MonthlySalary > 0) {
      return res.status(200).json({
        message: "Eligible for salary",
        monthlySalary: currentLevel.MonthlySalary,
        salarydays: currentLevel.salarydays,
        MinActiveRef: currentLevel.MinActiveRef,
      });
    }

    return res.status(200).json({ message: "Salary details not available" });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller for claiming salary

// Function to check and claim salary
export const checkAndClaimSalary = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user ID

    // Fetch user details
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's latest unlocked level
    const userLevel = await UserLevelModel.findOne({ userId })
      .populate("levelId") // Populate full level details
      .sort({ upgradeDate: -1 }); // Fetch the most recently upgraded level

    if (!userLevel) {
      return res.status(404).json({ message: "No unlocked levels found." });
    }

    const currentLevel = userLevel.levelId;

    // Check if the current level has a salary associated
    if (!currentLevel || currentLevel.MonthlySalary === 0) {
      return res.status(400).json({ message: "Not eligible for salary." });
    }

    // Fetch user's last salary claim for this level
    const lastClaim = await SalaryClaimModel.findOne({
      userId,
      levelId: currentLevel._id,
    }).sort({ claimEndTime: -1 }); // Get the latest salary claim for this level

    const salaryDays = currentLevel.salarydays || 30; // Default to 30 days

    if (lastClaim) {
      const currentDate = new Date();
      const lastClaimEndTime = new Date(lastClaim.claimEndTime);

      // Check if salary claim window is still active
      if (currentDate < lastClaimEndTime) {
        const remainingDays = Math.ceil(
          (lastClaimEndTime - currentDate) / (1000 * 60 * 60 * 24)
        );

        return res.status(400).json({
          message: `You can claim your salary again in ${remainingDays} days.`,
        });
      }
    }

    // Proceed to claim salary
    const salaryAmount = currentLevel.MonthlySalary;

    const newSalaryClaim = new SalaryClaimModel({
      userId,
      levelId: currentLevel._id,
      claimAmount: salaryAmount,
      claimStartTime: new Date(),
      claimEndTime: new Date(
        new Date().getTime() + salaryDays * 24 * 60 * 60 * 1000
      ), // Calculate claim window
    });

    await newSalaryClaim.save();

    // Update user's earnings
    user.TotalEarnings += salaryAmount;
    user.earnings += salaryAmount;
    await user.save();

    return res.status(200).json({
      message: "Salary claimed successfully.",
      claimAmount: salaryAmount,
      nextClaimAvailableOn: newSalaryClaim.claimEndTime,
      newEarnings: user.earnings,
    });
  } catch (error) {
    console.error("Error claiming salary:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSalaryClaimHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user

    // Fetch salary claims for the user
    const claims = await SalaryClaimModel.find({ userId }).sort({
      claimStartTime: -1,
    });

    if (!claims || claims.length === 0) {
      return res.status(404).json({ message: "No salary claims found." });
    }

    // Return claim history
    res.status(200).json({
      message: "Salary claim history retrieved successfully.",
      claims,
    });
  } catch (error) {
    console.error("Error fetching salary claim history:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getUserSalaryDetails = async (req, res) => {
  try {
    const userId = req.user._id; // Assume logged-in user's ID is set by auth middleware

    // Step 1: Fetch the user
    const user = await UserModel.findById(userId).select("email TotalEarnings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Fetch salary claims
    const salaryClaims = await SalaryClaimModel.find({ userId })
      .sort({ claimStartTime: -1 }) // Latest claims first
      .select("claimAmount claimStartTime claimEndTime");

    if (!salaryClaims || salaryClaims.length === 0) {
      return res
        .status(404)
        .json({ message: "No salary claims found for this user." });
    }

    // Step 3: Structure and return the response
    res.status(200).json({
      message: "User salary details retrieved successfully.",
      user: {
        email: user.email,
        totalEarnings: user.TotalEarnings,
      },
      salaryClaims,
    });
  } catch (error) {
    console.error("Error fetching user salary details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
