import mongoose from "mongoose";

const paymentaccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["EasyPaisa", "JazzCash"],
    required: true,
  },
});

export default mongoose.model("paymentaccount", paymentaccountSchema);
