import mongoose from "mongoose";

const LevelCreationSchema = new mongoose.Schema(
  {
    Level: { type: String, required: true, default: 0 },
    upgradeCommision: { type: String, required: true },
    MonthlySalary: { type: String, required: true },
    MinAmount: { type: String, required: true },
    MinActiveRef: { type: String, required: true },
    currency: {
      type: String,
      enum: ["USD", "PKR"],
    },
    salarydays: { type: String },
  },

  { timestamps: true }
);

export default mongoose.model("levelcreation", LevelCreationSchema);
