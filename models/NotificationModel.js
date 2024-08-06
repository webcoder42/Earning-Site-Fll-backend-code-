import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: false,
    },
    notification: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("notification", NotificationSchema);
