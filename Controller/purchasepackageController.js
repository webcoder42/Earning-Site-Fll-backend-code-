import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js"; // Assuming UserModel is your user model

// Function to update expired packages
const updateExpiredPackages = async (userId) => {
  const currentDate = new Date();

  // Find and update all expired packages for the user
  await PackagePurchaseModel.updateMany(
    {
      userId,
      expiryDate: { $lte: currentDate },
      packageStatus: { $ne: "Expired" },
    },
    { $set: { packageStatus: "Expired" } }
  );
};

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

    // Update expired packages for the user
    await updateExpiredPackages(userId);

    // Check if the user already has an active or expired package
    const existingPurchase = await PackagePurchaseModel.findOne({
      userId,
      packageStatus: { $in: ["Active", "pending", "Expired"] },
    });

    // Get the current date
    const currentDate = new Date();

    // Calculate the expiry date by adding the package duration to the current date
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(expiryDate.getDate() + pkg.duration);

    if (existingPurchase) {
      // Update existing package details
      existingPurchase.packagesId = pkg._id;
      existingPurchase.expiryDate = expiryDate;
      existingPurchase.transactionId = transactionId;
      existingPurchase.sendernumber = sendernumber;
      existingPurchase.packageStatus = "pending"; // Initially pending

      await existingPurchase.save();

      res.status(200).json({
        message: "Existing package details updated successfully",
        purchase: existingPurchase,
      });
    } else {
      // Create a new PackagePurchase document for the new package
      const purchase = new PackagePurchaseModel({
        userId: userId,
        packagesId: pkg._id,
        purchaseDate: currentDate,
        expiryDate: expiryDate,
        transactionId: transactionId,
        sendernumber: sendernumber,
        paymentStatus: "Completed",
        packageStatus: "pending", // Initially pending
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
      .populate({
        path: "userId",
        select: "email",
        model: UserModel,
      })
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

// Update status of the package purchase
export const updateStatusController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { packageStatus } = req.body;

    // Find the package purchase document
    const purchase = await PackagePurchaseModel.findById(packageId);
    if (!purchase) {
      return res.status(404).json({ message: "Package purchase not found" });
    }

    // Update expired packages for the user
    await updateExpiredPackages(purchase.userId);

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
            // Add the commission
            referrer.CommissionAmount =
              (referrer.CommissionAmount || 0) + commissionRate;
            referrer.earnings = (referrer.earnings || 0) + commissionRate;
            referrer.TotalEarnings =
              (referrer.TotalEarnings || 0) + commissionRate;
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
            // Deduct the commission
            referrer.CommissionAmount =
              (referrer.CommissionAmount || 0) - commissionRate;
            referrer.earnings = (referrer.earnings || 0) - commissionRate;
            referrer.TotalEarnings =
              (referrer.TotalEarnings || 0) - commissionRate;
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
    const userId = req.user._id; // Ensure this gets the user ID from the logged-in user context

    // Update expired packages for the user
    await updateExpiredPackages(userId);

    // Find the user's membership details
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

// Create commission
export const createCommissionController = async (req, res) => {
  const { userId, packageId } = req.body;

  try {
    // Fetch user and package details
    const user = await UserModel.findById(userId);
    const packages = await PackagesModel.findById(packageId);

    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      return res.status(404).send("User not found");
    }
    if (!packages) {
      return res.status(404).send("Package not found");
    }

    // Check if package is active
    if (packages.isActive) {
      // Calculate and update commission for the referrer
      if (user.referralCode) {
        const referrer = await UserModel.findOne({
          referralCode: user.referralCode,
        });

        if (referrer) {
          // Add the commission
          referrer.CommissionAmount =
            (referrer.CommissionAmount || 0) + packages.commissionRate;
          referrer.earnings =
            (referrer.earnings || 0) + packages.commissionRate;
          referrer.TotalEarnings =
            (referrer.TotalEarnings || 0) + packages.commissionRate;

          await referrer.save();

          console.log(
            `Commission added for referrer: ${referrer.email}, amount: ${packages.commissionRate}`
          );
        }
      }
    }

    // Return success response
    res.status(200).json({
      message: "Commission created successfully",
      commissionAmount: packages.commissionRate,
    });
  } catch (error) {
    console.error("Error creating commission:", error);
    res.status(500).json({ message: "Error creating commission" });
  }
};
