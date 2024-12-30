import mongoose from "mongoose";

const LongEarnSchema = new mongoose.Schema(
  {
    videotitle: { type: String, required: true },

    Link: { type: String, required: true },

    code: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("LongEarn", LongEarnSchema);
