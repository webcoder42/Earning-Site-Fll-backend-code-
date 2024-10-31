import AutoEarnStartModel from "../models/AutoEarnStartModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import UserModel from "../models/UserModel.js";

// Start earning session
export const startEarningSession = async (req, res) => {
  const userId = req.user._id; // Get user ID from auth middleware

  try {
    // Find the user's active package
    const purchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    }).populate("packagesId");

    if (!purchase) {
      return res
        .status(400)
        .json({ message: "No active package found for the user." });
    }

    // Check if a session already exists for the user
    const existingSession = await AutoEarnStartModel.findOne({
      user: userId,
      purchaseId: purchase._id,
      isClaimed: false,
    });

    // If an active session is running, return remaining time
    if (existingSession) {
      const remainingTime =
        new Date(existingSession.startTime.getTime() + 60 * 60 * 1000) -
        Date.now();
      if (remainingTime > 0) {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        return res.status(400).json({
          message:
            "Session already started. Please wait for the timer to complete.",
          remainingTime: `${hours} hours, ${minutes} minutes, and ${seconds} seconds`,
        });
      }
    }

    // Calculate hourly rate (40% of the package's earningRate)
    const hourlyRate = purchase.packagesId.earningRate * 0.4;

    // Create or reset a new earning session
    const newSession = new AutoEarnStartModel({
      user: userId,
      purchaseId: purchase._id,
      hourlyRate,
      startTime: Date.now(),
    });

    await newSession.save();

    res.status(201).json({
      message: "Earning session started successfully.",
      session: newSession,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check for existing earning session and auto-claim when session completes
export const checkActiveSession = async (req, res) => {
  const userId = req.user._id; // Get user ID from auth middleware

  try {
    // Find any existing session for the user that is not claimed
    const existingSession = await AutoEarnStartModel.findOne({
      user: userId,
      isClaimed: false,
    });

    // If no session found, return a message
    if (!existingSession) {
      return res.status(200).json({
        message: "No active earning session found for the user.",
        hasActiveSession: false,
      });
    }

    // Calculate remaining time for the session
    const remainingTime =
      new Date(existingSession.startTime.getTime() + 60 * 60 * 1000) -
      Date.now();

    if (remainingTime <= 0) {
      // If session time has completed, credit the user's earnings
      const user = await UserModel.findById(userId);
      if (user) {
        user.earnings += existingSession.hourlyRate;
        user.TotalEarnings += existingSession.hourlyRate;
        await user.save();
      }

      // Mark the session as claimed
      existingSession.isClaimed = true;
      await existingSession.save();

      return res.status(200).json({
        message: "Earnings claimed automatically as session completed.",
        amountClaimed: existingSession.hourlyRate,
      });
    }

    // If session is still running, return the remaining time
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    res.status(200).json({
      message: "An active earning session is currently running.",
      hasActiveSession: true,
      remainingTime: `${hours} hours, ${minutes} minutes, and ${seconds} seconds`,
      sessionDetails: existingSession,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get hourly amount
export const getUserHourlyEarnings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check for user's active package
    const purchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: "Active",
    }).populate("packagesId");

    if (!purchase) {
      return res
        .status(400)
        .json({ message: "No active package found for the user." });
    }

    // Calculate hourly earnings based on the active package rate
    const hourlyEarnings = purchase.packagesId.earningRate * 0.4;
    return res.json({
      success: true,
      hourlyEarnings,
    });
  } catch (error) {
    console.error("Error fetching hourly earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hourly earnings.",
    });
  }
};
//total seassion claim
export const totalEarnedAndSessions = async (req, res) => {
  const userId = req.user._id; // Get user ID from auth middleware

  try {
    // Find all completed sessions for the user
    const completedSessions = await AutoEarnStartModel.find({
      user: userId,
      isClaimed: true, // Only claimed sessions
    });

    // Calculate total earnings from completed sessions
    const totalEarned = completedSessions.reduce(
      (acc, session) => acc + session.hourlyRate,
      0
    );

    // Count total completed sessions
    const totalSessions = completedSessions.length;

    res.status(200).json({
      success: true,
      totalEarned,
      totalSessions,
      message: "Total earnings and sessions retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching total earnings and sessions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching total earnings and sessions.",
    });
  }
};

//admin search user seassion
export const getTotalSessionsAndEarningsByEmail = async (req, res) => {
  const { email } = req.query; // Email ko query parameter se le rahe hain

  try {
    // User ko email ke zariye find karo
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Claimed sessions ko AutoEarnStartModel se user ki ID ke saath find karo
    const completedSessions = await AutoEarnStartModel.find({
      user: user._id,
      isClaimed: true,
    });

    // Total earnings calculate karo by summing up hourlyRate of all sessions
    const totalEarned = completedSessions.reduce(
      (acc, session) => acc + session.hourlyRate,
      0
    );

    // Count total sessions
    const totalSessions = completedSessions.length;

    // Har session ka session ID aur start time bhi response mein bhej rahe hain
    const sessionDetails = completedSessions.map((session) => ({
      sessionId: session._id,
      startTime: session.startTime,
      hourlyRate: session.hourlyRate,
    }));

    // Response mein total earnings aur sessions bhejo
    res.status(200).json({
      success: true,
      email: user.email,
      totalEarned,
      totalSessions,
      sessionDetails,
      message: "Total earnings and sessions retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching total sessions and earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching total sessions and earnings.",
    });
  }
};
