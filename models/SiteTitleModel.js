import mongoose from "mongoose";

const titleSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    siteDeacription: {
      type: String,
      required: false,
      default:
        "Welcome to Y-Ads!.. Here you can earn money unlimited and make your future better.... You can earn by watching Ads by make team and alot of bonus and daily sunday offer. ",
    },
  },
  { timestamps: true }
);
export default mongoose.model("titles", titleSchema);
