import mongoose from "mongoose";

const LevelCreationSchema = new mongoose.Schema(
  {
    Level: { type: String, required: true, default: 0 },
    upgradeCommision: { type: Number, required: true },
    MonthlySalary: { type: Number, required: true },
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
