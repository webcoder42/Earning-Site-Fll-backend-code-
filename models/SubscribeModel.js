import mongoose from "mongoose";

const SubscribeSchema = new mongoose.Schema(
  {
    subscribechannallink: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: false,
    },
    status: {
      type: String,
      enum: ["subscribed", "not_subscribed"],
      default: "not_subscribed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscribe", SubscribeSchema);
