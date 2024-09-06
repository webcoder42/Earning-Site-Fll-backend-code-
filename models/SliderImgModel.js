import mongoose from "mongoose";
const imageSchema = new mongoose.Schema(
  {
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
