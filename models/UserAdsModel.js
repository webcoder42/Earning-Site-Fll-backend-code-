import mongoose from "mongoose";

const UserAdsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    packagePurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: false,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packages",
      required: false,
    },
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "advertisement",
      required: true,
    },

    viewedSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    viewedDate: {
      type: Date,
      default: Date.now,
    },
    earnedAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ads", UserAdsSchema);
