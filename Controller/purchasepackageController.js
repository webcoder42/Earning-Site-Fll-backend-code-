import PackagePurchaseModel from "../models/PackagePurchaseModel.js";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js"; // Assuming UserModel is your user model

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

    // Get the current date
    const currentDate = new Date();

    // Calculate the expiry date by adding the package duration to the current date
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(expiryDate.getDate() + pkg.duration);

    if (existingPurchase) {
      // Check if the existing package has expired
      if (existingPurchase.expiryDate <= currentDate) {
        existingPurchase.packageStatus = "Expired";
      } else {
        existingPurchase.packageStatus = "pending"; // Or other logic as needed
      }

      // Update existing package details
      existingPurchase.packagesId = pkg._id;
      existingPurchase.expiryDate = expiryDate;

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

//get all transaction
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

//upate status
// Update status of the package purchase
// Update status of the package purchase
// Define your exchange rate
// Define your exchange rate
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

            // Get the package's currency
            const Packagecurrency = pkg.Packagecurrency || "PKR"; // Default to PKR if not set

            // Get referrer's currency
            const referrerCurrency = referrer.currency || "PKR"; // Default to PKR if not set

            let commissionToAdd = commissionRate;

            // If the package currency is different from the referrer's currency, convert the commission accordingly
            if (Packagecurrency !== referrerCurrency) {
              if (Packagecurrency === "USD" && referrerCurrency === "PKR") {
                // Convert USD to PKR
                commissionToAdd = commissionRate * USD_TO_PKR_RATE;
              } else if (
                Packagecurrency === "PKR" &&
                referrerCurrency === "USD"
              ) {
                // Convert PKR to USD
                commissionToAdd = commissionRate / USD_TO_PKR_RATE;
              }
            }
            // If currencies are same, commissionToAdd remains as commissionRate

            // Add the calculated commission to the referrer's earnings and totals
            referrer.CommissionAmount =
              (parseFloat(referrer.CommissionAmount) || 0) + commissionToAdd;
            referrer.earnings =
              (parseFloat(referrer.earnings) || 0) + commissionToAdd;
            referrer.TotalEarnings =
              (parseFloat(referrer.TotalEarnings) || 0) + commissionToAdd;

            // Save the referrer with the updated earnings
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

            // Get the package's currency
            const packageCurrency = pkg.currency || "PKR"; // Default to PKR if not set

            // Get referrer's currency
            const referrerCurrency = referrer.currency || "PKR"; // Default to PKR if not set

            let commissionToDeduct = commissionRate;

            // If the package currency is different from the referrer's currency, convert the commission accordingly
            if (packageCurrency !== referrerCurrency) {
              if (packageCurrency === "USD" && referrerCurrency === "PKR") {
                // Convert USD to PKR
                commissionToDeduct = commissionRate * USD_TO_PKR_RATE;
              } else if (
                packageCurrency === "PKR" &&
                referrerCurrency === "USD"
              ) {
                // Convert PKR to USD
                commissionToDeduct = commissionRate / USD_TO_PKR_RATE;
              }
            }

            // Deduct the calculated commission from the referrer's earnings and totals
            referrer.CommissionAmount =
              (parseFloat(referrer.CommissionAmount) || 0) - commissionToDeduct;
            referrer.earnings =
              (parseFloat(referrer.earnings) || 0) - commissionToDeduct;
            referrer.TotalEarnings =
              (parseFloat(referrer.TotalEarnings) || 0) - commissionToDeduct;

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
//get single
/*export const getSingleController = async (req, res) => {
  try {
    const userId = req.user._id; // Ensure this gets the user ID from the logged-in user context

    // Find the user's membership details
    const membership = await PackagePurchaseModel.findOne({ userId }).populate({
      path: "packagesId",
      select: "name aduration earningRate",
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
};*/
//get single
export const getUserMembershipController = async (req, res) => {
  try {
    const userId = req.user._id; // Ensure this gets the user ID from the logged-in user context

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
