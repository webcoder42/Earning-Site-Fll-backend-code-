import mongoose from "mongoose";

const AutoEarnSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now, // Start time when earning session begins
    },
    claimedAmount: {
      type: Number,
      default: 0, // Initially, no amount claimed
    },
    isClaimed: {
      type: Boolean,
      default: false, // Initially false, will turn true after claim
    },
  },
  { timestamps: true }
);

export default mongoose.model("AutoEarnSession", AutoEarnSessionSchema);
