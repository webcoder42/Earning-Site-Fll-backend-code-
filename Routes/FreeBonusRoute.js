import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createBonus,
  getAllUserBonusDetails,
  getUserBonusDetails,
} from "../Controller/FreeBonusControlller.js";

const router = express.Router();

// Route to handle bonus creation
router.post("/create", requireSignIn, createBonus);
// Route to fetch user's bonus details
router.get("/getbonus", requireSignIn, getUserBonusDetails);

router.get("/admin/bonus", requireSignIn, isAdmin, getAllUserBonusDetails);

export default router;
