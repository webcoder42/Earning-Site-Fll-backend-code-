import mongoose from "mongoose";

const BonusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    CurrentPackage: { type: String, required: true },
    WorkingMonth: { type: String, required: true },
    TotalDepositTime: { type: String, required: true },
    TotalActiveRef: { type: String, required: true },
    AccountMethod: { type: String, required: true },
    AccountName: { type: String, required: true },
    AccountMumber: { type: String, required: true },

    Message: { type: String },
  },

  { timestamps: true }
);

export default mongoose.model("bonus", BonusSchema);
