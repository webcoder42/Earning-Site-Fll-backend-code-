import UserModel from "../models/UserModel.js";
import WithdrawalAccountModel from "../models/WithdrawalAccountModel.js";
import WithdrawalModel from "../models/WithdrawalModel.js";

// Create a new withdrawal request
export const createWithdrawalRequestController = async (req, res) => {
  try {
    const { amount, paymentMethod, accountNumber, accountName } = req.body;

    // Validation
    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }
    if (!paymentMethod) {
      return res.status(400).send({ error: "Payment Method is required" });
    }
    if (!accountNumber) {
      return res.status(400).send({ error: "Account Number is required" });
    }
    if (!accountName) {
      return res.status(400).send({ error: "Account Name is required" });
    }

    const user = await UserModel.findById(req.user._id); // Fetch user details

    // Check if user's earnings are sufficient
    if (amount > user.earnings) {
      return res.status(400).send({
        error: "Insufficient earnings",
        currentEarnings: user.earnings,
      });
    }

    // Check if amount meets the minimum withdrawal requirement
    const withdrawalAccount = await WithdrawalAccountModel.findById(
      paymentMethod
    );
    if (!withdrawalAccount) {
      return res.status(400).send({ error: "Invalid payment method" });
    }
    if (amount < withdrawalAccount.minAmount) {
      return res.status(400).send({
        error: `Minimum withdrawal amount is ${withdrawalAccount.minAmount}`,
      });
    }

    // Deduct the withdrawal amount from user's earnings
    user.earnings -= amount;
    await user.save();

    const newWithdrawal = new WithdrawalModel({
      userId: req.user._id,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
    });

    await newWithdrawal.save();

    res.status(201).send({
      success: true,
      message: "Withdrawal request created successfully",
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating withdrawal request",
      error: error.message,
    });
  }
};

// Get all withdrawals for a user
export const getUserWithdrawalsController = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find({})
      .populate("paymentMethod", "method")
      .populate("package", "name")
      .populate(
        "userId",
        "email earnings totalReferred packageActivationStatus Commission"
      );

    res.status(200).send({
      success: true,
      totalWithdrawals: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching withdrawals",
      error: error.message,
    });
  }
};

// Get a single withdrawal by ID
// Get the most recent withdrawal for the logged-in user
export const getSingleWithdrawalController = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the user ID from the authenticated user

    // Find the most recent withdrawal for the user
    const withdrawal = await WithdrawalModel.findOne({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("paymentMethod", "method");

    if (!withdrawal) {
      return res.status(404).send({
        success: false,
        message: "No withdrawals found for this user",
      });
    }

    res.status(200).send({
      success: true,
      withdrawal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching withdrawal",
      error: error.message,
    });
  }
};

// Update withdrawal status
export const updateWithdrawalStatusController = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status } = req.body;

    const withdrawal = await WithdrawalModel.findByIdAndUpdate(
      withdrawalId,
      { status },
      { new: true }
    );

    if (!withdrawal) {
      return res.status(404).send({
        success: false,
        message: "Withdrawal not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Withdrawal status updated successfully",
      withdrawal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating withdrawal status",
      error: error.message,
    });
  }
};

// Delete a withdrawal
export const deleteWithdrawalController = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await WithdrawalModel.findByIdAndDelete(id);

    if (!withdrawal) {
      return res.status(404).send({
        success: false,
        message: "Withdrawal not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Withdrawal deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting withdrawal",
      error: error.message,
    });
  }
};

//get all withdrawal of single user
export const getUserWithdrawalsByUserIdController = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user's ID is stored in req.user._id after authentication

    const withdrawals = await WithdrawalModel.find({ userId }).populate(
      "paymentMethod",
      "method"
    );

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No withdrawals found for this user",
      });
    }

    res.status(200).json({
      success: true,
      totalwithdrawal: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawals for user",
      error: error.message,
    });
  }
};
