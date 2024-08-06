import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    packagepurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: false,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packages",
      required: false,
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "withdrawalaccount",
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("withdrawal", WithdrawalSchema);
