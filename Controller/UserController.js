import { ComparePassword, HashPassword } from "../Helper/UserHelper.js";
import UserModel from "../models/UserModel.js";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import slugify from "slugify";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";

// Function to generate a unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Function to generate a unique slug
const generateUniqueSlug = async (username) => {
  let slug = slugify(username, { lower: true });
  let user = await UserModel.findOne({ slug });
  let counter = 1;

  while (user) {
    slug = `${slugify(username, { lower: true })}-${counter}`;
    user = await UserModel.findOne({ slug });
    counter++;
  }

  return slug;
};
const generateReferralLink = (referralCode) => {
  const baseUrl = "http://localhost:3000"; // Replace with your actual base URL
  return `${baseUrl}/login?referralCode=${referralCode}`;
};

// Registration Controller
export const registerController = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Validation
    if (!username) {
      return res.status(400).send({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(401).send({
        success: false,
        message: "Username or email already registered. Please login.",
      });
    }

    // Hash password
    const hashedPassword = await HashPassword(password);

    // Generate referral code
    const newReferralCode = crypto.randomBytes(4).toString("hex");

    // Generate referral link
    const referralLink = generateReferralLink(newReferralCode);

    // Generate unique slug
    const slug = await generateUniqueSlug(username);

    // Register new user
    const userRegister = new UserModel({
      username,
      slug,
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referralLink,
      accountStatus: "active",
    });

    // If referralCode is provided, update the referring user's data
    if (referralCode) {
      const referringUser = await UserModel.findOne({ referralCode });
      if (referringUser) {
        referringUser.totelreffered += 1; // Increment total referred
        await referringUser.save();

        // Store the referral in the new user's data
        userRegister.referredBy = referralCode;
      }
    }

    await userRegister.save();
    const totalUsers = await UserModel.countDocuments();
    res.status(201).send({
      success: true,
      total: totalUsers,
      message: "User registered successfully",
      user: userRegister,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//Login Controller
export const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username && !email) {
      return res.status(400).send({
        success: false,
        message: "Username or email is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Password is required",
      });
    }

    // Find user by username or email
    const user = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check password
    const match = await ComparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Create token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

//test Controlleer
export const testController = async (req, res) => {
  try {
    res.send("Protected route");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Example, use your email service
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    text: `To reset your password, please click the link below:
    http://localhost:3000/request-password-reset/${token}`, // Corrected the link
  };

  await transporter.sendMail(mailOptions);
};

// Request Password Reset Controller
export const requestPasswordResetController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send reset email
    await sendResetEmail(email, token);

    res.status(200).send({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in sending password reset email",
      error,
    });
  }
};
// Reset Password Controller
export const PasswordResetController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = req.params; // Retrieve token from URL params
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = JWT.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Find user by ID from token
    const user = await UserModel.findOne({ email });
    // If user not found or answer is incorrect
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "Wrong email or answer" });
    }
    // Hash new password
    const hashedPassword = await HashPassword(password);
    await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
    return res
      .status(200)
      .send({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in resetting password",
      error,
    });
  }
};

//update profile
export const ProfileController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await UserModel.findById(req.user._id);

    //password
    if (password && password.length < 8) {
      return res.json({
        error: "Password is required and must be at least 8 characters long",
      });
    }
    const hashedPassword = password ? await HashPassword(password) : undefined;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        username: username || user.username,
        email: email || user.email,

        password: hashedPassword || user.password,
      },
      { new: true } // This closing curly brace was missing
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Error in profile update",
      error,
    });
  }
};

//Profile password update
export const updatePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // Fetch the user from the database
    const user = await UserModel.findById(req.user._id);

    // Check if current password matches
    const match = await ComparePassword(currentPassword, user.password);
    if (!match) {
      return res
        .status(400)
        .send({ success: false, message: "Current password is incorrect" });
    }

    // Validate new password length
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).send({
        success: false,
        message:
          "New password is required and must be at least 8 characters long",
      });
    }

    // Hash the new password
    const hashedPassword = await HashPassword(newPassword);

    // Update the user's password in the database
    await UserModel.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    });

    return res
      .status(200)
      .send({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while updating password",
      error,
    });
  }
};

//All user
export const allUserController = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await UserModel.find(); // Use find() without any conditions to get all documents
    res.status(200).send(users); // Send the users as JSON response
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

//totel count user
export const getTotalUsersCount = async (req, res) => {
  try {
    const userCount = await UserModel.countDocuments({});
    res.status(200).json({ userCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//check the recent user register
/*export const recentController = async (req, res) => {
  try {
    const recentUsers = await UserModel.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(recentUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//show the user earning

export const getUserEarnings = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ earnings: user.earnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};*/
//total refferal

export const getTotalReferrals = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user._id; // Assuming you store user ID in req.user from authentication middleware

    // Find the user based on user ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all users who have registered with this user's referral code
    const referredUsers = await UserModel.find({
      referredBy: user.referralCode,
    });

    // Prepare an array to store referral details
    let referralDetails = [];

    // Loop through referred users to fetch their details
    for (const referredUser of referredUsers) {
      // Find package purchase details for each referred user
      const packagePurchase = await PackagePurchaseModel.findOne({
        userId: referredUser._id,
      }).populate("packagesId", "name packageStatus"); // Populate 'packagesId' with 'name' and 'packageStatus'

      // Add relevant details to referralDetails
      referralDetails.push({
        username: referredUser.username,
        email: referredUser.email,
        packageName: packagePurchase ? packagePurchase.packagesId.name : null,
        packageStatus: packagePurchase ? packagePurchase.packageStatus : null,
      });
    }

    // Get the total number of referrals
    const totalReferrals = referralDetails.length;

    res.status(200).json({ totalReferrals, referralDetails });
  } catch (error) {
    console.error("Error fetching total referrals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UserController.js
// UserController.js
// controllers/userController.js

export const getEarningSlug = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID from the request object
    const user = await UserModel.findById(userId).select(
      "earnings TotalEarnings CommissionAmount"
    ); // Fetch user's earnings and totalEarnings

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      earnings: user.earnings,
      totalEarnings: user.TotalEarnings,
      CommissionAmount: user.CommissionAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//seach
export const searchController = async (req, res) => {
  try {
    const { username } = req.query;
    const users = await UserModel.find({ username: new RegExp(username, "i") });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

//get refferal code
export const getRefferalCodeController = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains the authenticated user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ referralCode: user.referralCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//get refferal link
export const getRefferallinkCodeController = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains the authenticated user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ referralLink: user.referralLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
