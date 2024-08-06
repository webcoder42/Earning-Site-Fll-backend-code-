import express from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import morgan from "morgan";
import UserRoute from "./Routes/UserRoute.js";
import PackageRoute from "./Routes/PackagesRoute.js";
import SiteRoute from "./Routes/SiteRoute.js";
import PackagePurchase from "./Routes/PackagePurchaseRoute.js";
import PaymentAccount from "./Routes/PaymentAccountRoute.js";

import Advertsiment from "./Routes/AdvertisementRoute.js";
import Ads from "./Routes/UserAdsRoute.js";
import Withdrawal from "./Routes/WithdrawalRoute.js";
import UserWithdrawal from "./Routes/UserWithdrawalRoute.js";
import Notification from "./Routes/NotificationRoute.js";
import Contact from "./Routes/ContactRoute.js";
import Subscribe from "./Routes/SubscribeRoute.js";
import Commision from "./Routes/CommissionRoute.js";
import "./Helper/cronJobs.js";

import cors from "cors";

const app = express();

dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/users", UserRoute);
app.use("/api/v1/package", PackageRoute);
app.use("/api/v1/title", SiteRoute);
app.use("/api/v1/purchase", PackagePurchase);
app.use("/api/v1/account", PaymentAccount);
app.use("/api/v1/commission", Commision);
app.use("/api/v1/advertisement", Advertsiment);
app.use("/api/v1/ads", Ads);
app.use("/api/v1/withdrawal", Withdrawal);
app.use("/api/v1/userwithdrawal", UserWithdrawal);
app.use("/api/v1/notifiication", Notification);
app.use("/api/v1/contact", Contact);
app.use("/api/v1/subscribe", Subscribe);

app.get("/", (req, res) => {
  res.send("Welcome to web");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
