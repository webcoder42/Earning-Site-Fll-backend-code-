import mongoose from "mongoose";

const taskClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    claimed: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    claimButton: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaskClaim", taskClaimSchema);
