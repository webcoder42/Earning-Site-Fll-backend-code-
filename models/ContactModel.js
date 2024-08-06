import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    Descriptions: {
      type: String,
      required: true,
    },
    Link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("contact", ContactSchema);
