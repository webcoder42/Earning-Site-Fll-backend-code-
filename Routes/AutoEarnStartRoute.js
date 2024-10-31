import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  checkActiveSession,
  getTotalSessionsAndEarningsByEmail,
  getUserHourlyEarnings,
  startEarningSession,
  totalEarnedAndSessions,
} from "../Controller/AutoEarnStartController.js";

const router = express.Router();

// Route to start auto earn
router.post("/start", requireSignIn, startEarningSession);

//check
router.get("/check-active-session", requireSignIn, checkActiveSession);

//hourly amount
router.get("/hourly-earnings", requireSignIn, getUserHourlyEarnings);

//total  amount get
router.get("/total-auto-earn", requireSignIn, totalEarnedAndSessions);

router.get(
  "/user-sessions",
  requireSignIn,
  isAdmin,
  getTotalSessionsAndEarningsByEmail
);

export default router;
