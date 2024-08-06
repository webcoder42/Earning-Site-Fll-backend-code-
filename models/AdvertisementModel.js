import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoLink: { type: String, required: true }, // Link to the video
    duration: { type: Number, required: true }, // Duration in seconds
    earningRate: { type: Number, required: true }, // Earning rate per view
  },
  { timestamps: true }
);

export default mongoose.model("advertisement", advertisementSchema);
