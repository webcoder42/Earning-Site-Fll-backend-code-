import mongoose from "mongoose";

const LongAdsSchema = new mongoose.Schema(
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
    LongEarnAdsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LongEarn",
      required: true,
    },

    code: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    viewedDate: {
      type: Date,
      default: Date.now,
    },
    earnMoney: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("longads", LongAdsSchema);
