import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Link to the user
    email: {
      type: String,
      required: true,
    }, // User's email
    message: {
      type: String,
      required: false,
    }, // Actual message content (manual or auto)

    withdrawalMessage: {
      type: String,
      default:
        "Congratulations! Your withdrawal has been successfully Received.", // Default withdrawal message
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
