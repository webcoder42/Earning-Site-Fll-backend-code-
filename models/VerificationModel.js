import mongoose from "mongoose";

const VeriificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    CNIC: {
      type: String,
      default: null,
    },
    Name: {
      type: String,
      default: null,
    },

    phoneNo: {
      type: String,
      default: null,
    },

    verification: {
      type: String,
      enum: ["verify", "checking", "unverify"],
      default: "unverify",
    },
  },
  { timestamps: true }
);

export default mongoose.model("verify", VeriificationSchema);
