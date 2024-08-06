import WithdrawalAccountModel from "../models/WithdrawalAccountModel.js";
import fs from "fs";

// Controller to create a new withdrawal account
export const createAccountController = async (req, res) => {
  try {
    const { method, minAmount } = req.fields;
    const { photo } = req.files;

    // Validation
    if (!method) {
      return res.status(400).send({ error: "Method is required" });
    }
    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1 MB" });
    }

    // Check if method already exists
    const existingMethod = await WithdrawalAccountModel.findOne({ method });
    if (existingMethod) {
      return res.status(400).send({ error: "Method already exists" });
    }

    const newWithdrawalAccount = new WithdrawalAccountModel({
      method,
      minAmount,
    });

    if (photo) {
      newWithdrawalAccount.photo.data = fs.readFileSync(photo.path);
      newWithdrawalAccount.photo.contentType = photo.type;
    }

    await newWithdrawalAccount.save();
    res.status(201).send({
      success: true,
      message: "Withdrawal method created successfully",
      withdrawalAccount: newWithdrawalAccount,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in creating withdrawal method",
      error,
    });
  }
};

// Controller to get all withdrawal accounts
export const getWithdrawalController = async (req, res) => {
  try {
    const withdrawalAccounts = await WithdrawalAccountModel.find({});
    res.status(200).send({
      message: "All withdrawal accounts retrieved successfully",
      withdrawalAccounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch withdrawal accounts" });
  }
};

// Controller to get a single withdrawal account by ID
export const getSingleAccountController = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawalAccount = await WithdrawalAccountModel.findById(id);
    if (!withdrawalAccount) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal account not found",
      });
    }
    // Convert photo data to base64 to send in response
    const photoData = withdrawalAccount.photo
      ? withdrawalAccount.photo.data.toString("base64")
      : null;

    res.status(200).json({
      success: true,
      withdrawalAccount: {
        _id: withdrawalAccount._id,
        method: withdrawalAccount.method,
        // Include photo data if available
        photo: photoData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal account",
      error,
    });
  }
};

//get photo
export const PhotoController = async (req, res) => {
  try {
    const withdrawalAccount = await WithdrawalAccountModel.findById(
      req.params.pid
    );

    if (!withdrawalAccount || !withdrawalAccount.photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found for this withdrawal account",
      });
    }

    res.set("Content-Type", withdrawalAccount.photo.contentType);
    res.send(withdrawalAccount.photo.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch photo for withdrawal account",
      error: error.message,
    });
  }
};

//update
export const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, minAmount } = req.body;
    const { photo } = req.files;

    // Check if the updated method already exists
    const existingMethod = await WithdrawalAccountModel.findOne({ method });
    if (existingMethod && existingMethod._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Method already exists with a different id",
      });
    }

    const updateData = { method, minAmount };

    if (photo) {
      if (photo.size > 1000000) {
        return res
          .status(400)
          .send({ error: "Photo should be less than 1 MB" });
      }
      updateData.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    const updatedAccount = await WithdrawalAccountModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      updatedAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Account update failed",
      error,
    });
  }
};

//delete
export const deleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAccount = await WithdrawalAccountModel.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Account deletion failed",
      error,
    });
  }
};
