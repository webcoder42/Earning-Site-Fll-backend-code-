import mongoose from "mongoose";

const UserLevelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LevelCreation",
      required: true,
    },
    status: {
      type: String,
      enum: ["Eligible", "Inactive", "NotEligible"],
      default: "NotEligible",
    },
    upgradeCommission: {
      type: Number,
      default: 0, // Total commission earned by the user for this level
    },
    monthlySalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    upgradeDate: {
      type: Date,
    },
    salaryRemarks: {
      type: String,
      default: "Congratulations! You have received your monthly salary.",
    },
    levelUpgradeRemarks: {
      type: String,
      default:
        "Congratulations! Your level has been upgraded successfully, and you have received your commission.",
    },
    salaryTimeRemarks: {
      type: String,
      default:
        "Please check the details and requirements for the salary. Ensure your active referrals and total earnings fulfill our level requirements.",
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserLevel", UserLevelSchema);
