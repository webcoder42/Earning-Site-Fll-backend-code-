import mongoose from "mongoose";
import UserModel from "./UserModel.js";

const PackagePurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    packagesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packages",
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      required: true,
    },
    sendernumber: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    packageStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "Completed",
        "Active",
        "cancel",
        "Expired",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Add post-save hook to update user packageActivationStatus
PackagePurchaseSchema.post("save", async function (doc) {
  try {
    await UserModel.findByIdAndUpdate(
      doc.userId,
      { packageActivationStatus: doc.packageStatus },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating user's packageActivationStatus:", error);
  }
});
const PackagePurchaseModel = mongoose.model("Purchase", PackagePurchaseSchema);

export default PackagePurchaseModel;
