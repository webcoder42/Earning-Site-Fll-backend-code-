import VerificationModel from "../models/VerificationModel.js";
import UserModel from "../models/UserModel.js";

// 1. User fills verification data
export const fillVerificationData = async (req, res) => {
  try {
    const { CNIC, Name, phoneNo } = req.body;
    const userId = req.user._id;

    // Check if the user already has a verification record
    const existingVerification = await VerificationModel.findOne({ userId });

    if (existingVerification) {
      if (existingVerification.verification === "unverify") {
        return res.status(400).json({
          message:
            "Your previous verification was rejected. Please fill the form again.",
        });
      } else {
        return res
          .status(400)
          .json({ message: "You cannot submit verification again." });
      }
    }

    // Check CNIC usage (max 2 accounts)
    const cnicCount = await VerificationModel.countDocuments({ CNIC });
    if (cnicCount >= 2) {
      return res
        .status(400)
        .json({ message: "This CNIC is already used for two accounts." });
    }

    // Create a new verification record with "checking" status
    const verification = new VerificationModel({
      userId,
      CNIC,
      Name,
      phoneNo,
      verification: "checking",
    });
    await verification.save();

    res.status(201).json({
      message: "Verification data submitted successfully.",
      verification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const getUserVerificationData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Try to find the verification record for the logged-in user
    const verification = await VerificationModel.findOne({ userId });

    if (!verification) {
      // Agar verification ka record nahi milta, toh "unverify" status dikhao
      return res.status(200).json({
        message: "No verification data found.",
        verification: { userId, verification: "unverify" }, // Default "unverify" status
      });
    }

    // Agar record milta hai, toh uska actual status dikhao
    res.status(200).json({ verification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// 3. Admin gets all verification data
export const getAllVerificationData = async (req, res) => {
  try {
    const verifications = await VerificationModel.find().populate(
      "userId",
      "Name email"
    );

    res.status(200).json({
      Total: verifications.length,
      verifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// 4. Admin updates verification status
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Verification record ID
    const { status } = req.body;

    if (!["verify", "unverify", "checking"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const verification = await VerificationModel.findById(id);

    if (!verification) {
      return res
        .status(404)
        .json({ message: "Verification record not found." });
    }

    // Update the verification record
    verification.verification = status;
    await verification.save();

    res.status(200).json({
      message: "Verification status updated successfully.",
      verification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// 5. Admin edits or deletes verification data
export const editVerificationData = async (req, res) => {
  try {
    const { id } = req.params; // Verification record ID
    const { CNIC, Name, phoneNo } = req.body;

    const verification = await VerificationModel.findByIdAndUpdate(
      id,
      { CNIC, Name, phoneNo },
      { new: true }
    );

    if (!verification) {
      return res
        .status(404)
        .json({ message: "Verification record not found." });
    }

    res.status(200).json({
      message: "Verification data updated successfully.",
      verification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const deleteVerificationData = async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await VerificationModel.findByIdAndDelete(id);

    if (!verification) {
      return res
        .status(404)
        .json({ message: "Verification record not found." });
    }

    res.status(200).json({
      message: "Verification record deleted successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const getVerifiedVerificationData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find verification record for the logged-in user
    const verification = await VerificationModel.findOne({ userId });

    // Check if record exists and verification status is 'verify'
    if (!verification || verification.verification !== "verify") {
      return res.status(403).json({
        message:
          "Access denied. Your verification is either incomplete or rejected.",
      });
    }

    // Return the verification data
    res.status(200).json({
      message: "Verification data retrieved successfully.",
      verification,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
      error: error.message,
    });
  }
};
