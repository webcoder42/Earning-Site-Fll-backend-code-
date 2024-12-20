import mongoose from "mongoose";

const SalaryClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "levelcreation",
      required: true,
    },
    claimAmount: { type: Number, required: true },
    claimStartTime: { type: Date, required: true },
    claimEndTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("salary", SalaryClaimSchema);
{
}
