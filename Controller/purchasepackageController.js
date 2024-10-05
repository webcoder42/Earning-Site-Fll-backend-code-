import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js"; // Assuming UserModel is your user model

// Package Purchase Controller
export const packagePurchaseController = async (req, res) => {
  try {
    const { slug, transactionId, sendernumber } = req.body;
    const userId = req.user._id;

    // Check for existing transaction ID
    const existingTransaction = await PackagePurchaseModel.findOne({
      transactionId,
    });
    if (existingTransaction) {
      return res.status(400).json({ message: "Transaction ID already exists" });
    }

    // Find the package
    const pkg = await PackagesModel.findOne({ slug });
    if (!pkg || !pkg.isActive) {
      return res
        .status(400)
        .json({ message: "Package not available or inactive" });
    }

    // Check if the user already has an active package
    const existingPurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: {
        $in: ["Active", "pending", "Completed", "Expired", "cancel"],
      },
    });

    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(expiryDate.getDate() + pkg.duration); // Calculate expiry

    if (existingPurchase) {
      if (existingPurchase.expiryDate <= currentDate) {
        existingPurchase.packageStatus = "Expired";
      } else {
        existingPurchase.packageStatus = "pending";
      }

      existingPurchase.packagesId = pkg._id;
      existingPurchase.expiryDate = expiryDate;

      await existingPurchase.save();

      res.status(200).json({
        message: "Existing package details updated successfully",
        purchase: existingPurchase,
      });
    } else {
      const purchase = new PackagePurchaseModel({
        userId,
        packagesId: pkg._id,
        purchaseDate: currentDate,
        expiryDate,
        transactionId,
        sendernumber,
        paymentStatus: "Completed",
        packageStatus: "pending",
      });

      await purchase.save();

      res
        .status(200)
        .json({ message: "Package purchased successfully", purchase });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all transactions
export const getAllTransactionController = async (req, res) => {
  try {
    const transactions = await PackagePurchaseModel.find({})
      .populate({ path: "userId", select: "email", model: UserModel })
      .populate({
        path: "packagesId",
        select: "name price",
        model: PackagesModel,
      });

    res.status(200).send({
      success: true,
      totalTransaction: transactions.length,
      message: "All Transaction list",
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting Transaction",
    });
  }
};

// Update package status and handle commission
const USD_TO_PKR_RATE = 280;

export const updateStatusController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { packageStatus } = req.body;

    // Find the package purchase document
    const purchase = await PackagePurchaseModel.findById(packageId);
    if (!purchase) {
      return res.status(404).json({ message: "Package purchase not found" });
    }

    // Check for expiry immediately
    const currentDate = new Date();
    if (
      purchase.expiryDate <= currentDate &&
      purchase.packageStatus !== "Expired"
    ) {
      purchase.packageStatus = "Expired";
    } else {
      // Validate and update the status
      const validStatusValues = [
        "pending",
        "processing",
        "Active",
        "cancel",
        "Expired",
        "Completed",
      ];
      if (!validStatusValues.includes(packageStatus)) {
        return res.status(400).json({ message: "Invalid package status" });
      }
      purchase.packageStatus = packageStatus;
    }

    // Finalize commission when package becomes active
    if (packageStatus === "Active") {
      const user = await UserModel.findById(purchase.userId);
      if (user && user.referredBy) {
        const referrer = await UserModel.findOne({
          referralCode: user.referredBy,
        });
        if (referrer) {
          const pkg = await PackagesModel.findById(purchase.packagesId);
          if (pkg) {
            const commissionRate = pkg.commissionRate || 0;

            // Check currencies
            const userCurrency = user.currency; // User's currency
            const referrerCurrency = referrer.currency; // Referrer's currency

            let commissionToAdd;

            if (userCurrency === referrerCurrency) {
              // Same currency, add directly
              commissionToAdd = commissionRate;
            } else {
              // Different currencies, handle conversion
              if (userCurrency === "USD" && referrerCurrency === "PKR") {
                // Convert commission rate from USD to PKR
                commissionToAdd = commissionRate * 280; // Assuming 1 USD = 280 PKR
              } else if (userCurrency === "PKR" && referrerCurrency === "USD") {
                // Convert commission rate from PKR to USD
                commissionToAdd = commissionRate / 280; // Assuming 1 USD = 280 PKR
              } else {
                return res
                  .status(400)
                  .json({ message: "Unsupported currency conversion." });
              }
            }

            // Add the commission
            referrer.CommissionAmount =
              (referrer.CommissionAmount || 0) + commissionToAdd;
            referrer.earnings = (referrer.earnings || 0) + commissionToAdd;
            referrer.TotalEarnings =
              (referrer.TotalEarnings || 0) + commissionToAdd;
            await referrer.save();
          }
        }
      }
    } else if (["reject", "cancel"].includes(packageStatus)) {
      const user = await UserModel.findById(purchase.userId);
      if (user && user.referredBy) {
        const referrer = await UserModel.findOne({
          referralCode: user.referredBy,
        });
        if (referrer) {
          const pkg = await PackagesModel.findById(purchase.packagesId);
          if (pkg) {
            const commissionRate = pkg.commissionRate || 0;

            // Check currencies
            const userCurrency = user.currency; // User's currency
            const referrerCurrency = referrer.currency; // Referrer's currency

            let commissionToDeduct;

            if (userCurrency === referrerCurrency) {
              // Same currency, deduct directly
              commissionToDeduct = commissionRate;
            } else {
              // Different currencies, handle conversion
              if (userCurrency === "USD" && referrerCurrency === "PKR") {
                // Convert commission rate from USD to PKR
                commissionToDeduct = commissionRate * 280; // Assuming 1 USD = 280 PKR
              } else if (userCurrency === "PKR" && referrerCurrency === "USD") {
                // Convert commission rate from PKR to USD
                commissionToDeduct = commissionRate / 280; // Assuming 1 USD = 280 PKR
              } else {
                return res
                  .status(400)
                  .json({ message: "Unsupported currency conversion." });
              }
            }

            // Deduct the commission
            referrer.CommissionAmount =
              (referrer.CommissionAmount || 0) - commissionToDeduct;
            referrer.earnings = (referrer.earnings || 0) - commissionToDeduct;
            referrer.TotalEarnings =
              (referrer.TotalEarnings || 0) - commissionToDeduct;
            await referrer.save();
          }
        }
      }
    }

    // Save the updated status
    await purchase.save();

    res
      .status(200)
      .json({ message: "Package status updated successfully", purchase });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user membership details
export const getUserMembershipController = async (req, res) => {
  try {
    const userId = req.user._id;

    const membership = await PackagePurchaseModel.findOne({ userId }).populate({
      path: "packagesId",
      select: "name duration earningRate",
      model: PackagesModel,
    });

    if (!membership) {
      return res.status(404).json({ message: "No membership found" });
    }

    res.status(200).json({
      packageName: membership.packagesId.name,
      packageStatus: membership.packageStatus,
      purchaseDate: membership.purchaseDate,
      expiryDate: membership.expiryDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
