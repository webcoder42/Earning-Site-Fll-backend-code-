import FreeBonusModel from "../models/FreeBonusModel.js";
import UserModel from "../models/UserModel.js";

export const createBonus = async (req, res) => {
  try {
    const {
      CurrentPackage,
      WorkingMonth,
      TotalDepositTime,
      TotalActiveRef,
      AccountMethod,
      AccountName,
      AccountMumber,
      Message,
    } = req.body;

    // Get the logged-in user's ID
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found" });
    }

    // Verify user existence
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingdata = await FreeBonusModel.findOne({ userId });
    if (existingdata) {
      return res.status(404).json({ message: "You already submit" });
    }
    // Create bonus with userId
    const newBonus = new FreeBonusModel({
      ref: user._id, // User's ObjectId
      userId, // Pass userId explicitly
      CurrentPackage,
      WorkingMonth,
      TotalDepositTime,
      TotalActiveRef,
      AccountMethod,
      AccountMumber,
      AccountName,
      Message,
    });

    // Save the bonus record
    const savedBonus = await newBonus.save();

    res.status(201).json({
      message: "Bonus record created successfully",
      bonus: savedBonus,
    });
  } catch (error) {
    console.error("Error while creating bonus record:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

//get

// Get logged-in user's email and associated bonus records
// Controller
export const getUserBonusDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingBonus = await FreeBonusModel.findOne({ userId });

    res.status(200).json({
      message: "User bonus details retrieved successfully",
      user: {
        email: user.email,
        name: user.name,
      },
      bonus: existingBonus,
    });
  } catch (error) {
    console.error("Error while fetching user bonus details:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};
//admin get

export const getAllUserBonusDetails = async (req, res) => {
  try {
    // Fetch all bonus records
    const allBonusRecords = await FreeBonusModel.find()
      .populate("userId", "email ") // Populating user details like email, name
      .exec();

    if (!allBonusRecords || allBonusRecords.length === 0) {
      return res.status(404).json({ message: "No bonus records found" });
    }

    // Format the response to include all bonus details
    const bonusDetails = allBonusRecords.map((bonus) => ({
      user: {
        email: bonus.userId.email, // User's email
        name: bonus.userId.name, // User's name
      },
      CurrentPackage: bonus.CurrentPackage,
      WorkingMonth: bonus.WorkingMonth,
      TotalDepositTime: bonus.TotalDepositTime,
      TotalActiveRef: bonus.TotalActiveRef,
      AccountMethod: bonus.AccountMethod,
      AccountName: bonus.AccountName,
      AccountMumber: bonus.AccountMumber,
      Message: bonus.Message,
      createdAt: bonus.createdAt,
    }));

    res.status(200).json({
      message: "All bonus records retrieved successfully",
      TotalBonus: bonusDetails.length,
      bonuses: bonusDetails,
    });
  } catch (error) {
    console.error("Error while fetching all bonus records:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};
