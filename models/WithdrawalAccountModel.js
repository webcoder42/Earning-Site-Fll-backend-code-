import mongoose from "mongoose";

const withdrawalAccountSchema = new mongoose.Schema(
  {
    method: {
      type: String,

      required: true,
    },
    minAmount: { type: Number, default: 120 },
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);
export default mongoose.model("withdrawalaccount", withdrawalAccountSchema);
