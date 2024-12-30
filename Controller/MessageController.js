// controllers/messageController.js

import MessageModel from "../models/MessageModel.js";

// Create a new message

import UserModel from "../models/UserModel.js";
import WithdrawalModel from "../models/WithdrawalModel.js";

export const createMessage = async (req, res) => {
  try {
    const { email, message } = req.body; // Extract email and message from the request body

    // Find the user by the provided email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with the provided email not found.",
      });
    }

    // Create a new message document
    const newMessage = new MessageModel({
      email,
      message,
      userId: user._id, // Store the user's ID
    });

    // Save the message in the database
    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message!",
      error: error.message,
    });
  }
};

// controllers/messageController.js

// Function to get message for a logged-in user

export const getMessageForUser = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is logged in and user info is in req.user

    // Verify if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch all messages for the logged-in user and sort by creation date (newest first)
    const messages = await MessageModel.find({ userId }).sort({
      createdAt: -1,
    });

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No messages found for this user.",
      });
    }

    // Return messages
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully!",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching messages.",
      error: error.message,
    });
  }
};

// Function to auto-send message if withdrawal status is approved
// controllers/messageController.js

export const checkAndSendMessageForApprovedUser = async (req, res) => {
  try {
    // 1. Find withdrawal with "approved" status for the user
    const withdrawal = await WithdrawalModel.findOne({
      userId: req.user._id,
      status: "approved",
    });

    // 2. If no approved withdrawal found, send a response
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "No approved withdrawal found for this user.",
      });
    }

    // 3. Find the user by user ID
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 4. Check if the message already exists for this user
    const existingMessage = await MessageModel.findOne({ userId: user._id });

    // 5. If message doesn't exist, create and send a new message
    if (!existingMessage) {
      const newMessage = new MessageModel({
        email: user.email,

        message: `Congratulations! Your withdrawal of ${withdrawal.amount} has been successfully approved on ${withdrawal.date}.`,
        userId: user._id,
      });

      // Save the new message
      await newMessage.save();

      return res.status(201).json({
        success: true,
        message: "Message sent successfully!",
        data: newMessage,
      });
    } else {
      // 6. If message exists, return the existing message
      return res.status(200).json({
        success: true,
        message: "Message already exists for this user.",
        data: existingMessage,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error processing message.",
      error: error.message,
    });
  }
};
