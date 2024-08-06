import mongoose from "mongoose";

const packagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },

    earningRate: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean, // To track if the package is active or not
      default: "false",
    },
    numOfAds: {
      type: Number,
      required: false,
      default: 20,
    },

    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("packages", packagesSchema);
