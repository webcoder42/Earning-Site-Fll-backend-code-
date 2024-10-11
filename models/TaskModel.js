import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskType: {
      type: String,
      required: true,
      enum: ["referral", "sundayOffer", "link", "monthlyOffer"], // Add 'link' to task types
    },
    referralRequirement: {
      type: Number,
      required: function () {
        return this.taskType === "referral";
      },
    },
    Links: {
      type: String,
      required: function () {
        return this.taskType === "link";
      },
    },
    offerDay: {
      type: String,
      required: function () {
        return this.taskType === "sundayOffer";
      },
      enum: ["Sunday"],
    },
    monthlyDay: {
      type: String,
      required: function () {
        return this.taskType === "monthlyOffer";
      },
      enum: ["month"],
    },
    price: {
      type: Number,
      min: 0, // Price should be non-negative
    },
    claimable: {
      type: Boolean,
      default: false, // Initially, tasks aren't claimable
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "PKR"], // Allowed currencies
    },
    reward: {
      type: String,
      required: true,
      default: "Reward description here", // Default reward description
    },
    followLink: {
      type: String,
      required: false, // Optional link for the task
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
