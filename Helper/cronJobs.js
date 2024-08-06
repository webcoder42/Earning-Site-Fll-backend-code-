import cron from "node-cron";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js";

// Define the cron job to run daily
cron.schedule("0 * * * *", async () => {
  // Runs every hour
  try {
    const currentDate = new Date();
    const expiredPackages = await PackagePurchaseModel.find({
      expiryDate: { $lte: currentDate },
      packageStatus: { $ne: "Expired" },
    });

    for (const purchase of expiredPackages) {
      purchase.packageStatus = "Expired";
      await purchase.save();
    }

    console.log("Expired packages status updated successfully.");
  } catch (error) {
    console.error("Error updating expired packages status:", error);
  }
});
