import CommissionModel from "../models/CommissionModel.js";
import UserModel from "../models/UserModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";

export const addCommissionOnPackageActivation = async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user whose package is activated

    // Validate the userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the user's package purchase record and populate the packagesId
    const purchase = await PackagePurchaseModel.findOne({
      userId: userId,
    }).populate({
      path: "packagesId",
      model: "packages", // Reference to Package model
    });

    if (!purchase) {
      return res
        .status(404)
        .json({ message: "Package purchase record not found" });
    }

    // Ensure the package is active
    if (purchase.packageStatus !== "Active") {
      return res.status(400).json({ message: "Package is not active" });
    }

    // Find the user whose package has been activated
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has been referred by someone
    if (!user.referredBy) {
      return res
        .status(400)
        .json({ message: "User has not been referred by anyone" });
    }

    // Validate the referredBy ID
    if (!isValidObjectId(user.referredBy)) {
      return res.status(400).json({ message: "Invalid referredBy ID format" });
    }

    // Find the referring user
    const referringUser = await UserModel.findById(user.referredBy);

    if (!referringUser) {
      return res.status(404).json({ message: "Referring user not found" });
    }

    // Ensure packagesId is populated with a valid Package
    if (!purchase.packagesId) {
      return res.status(400).json({ message: "Package is missing" });
    }

    // Get the activated package
    const packages = purchase.packagesId;

    // Calculate the commission amount
    const commissionAmount = packages.CommissionRate;

    // Create a new commission record for the referring user
    const commission = new CommissionModel({
      user: referringUser._id,
      purchaseId: purchase._id,
      CommissionAmount: commissionAmount,
    });

    // Save the commission record
    await commission.save();

    // Update the referring user's earnings
    referringUser.CommissionAmount += commissionAmount;
    referringUser.earnings += commissionAmount;
    referringUser.TotalEarnings += commissionAmount;
    await referringUser.save();

    return res.status(200).json({ message: "Commission added successfully" });
  } catch (error) {
    console.error("Error adding commission:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
