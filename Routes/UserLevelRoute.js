import express from "express";
import {
  getCurrentUserLevel,
  getLevelsByCurrency,
  getUserLevelByEmail,
  unlockLevel,
  checkAndClaimSalary,
  getSalaryForCurrentLevel,
  getSalaryClaimHistory,
  getUserSalaryDetails,
} from "../Controller/UserLevelController.js";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";

const router = express.Router();

// Route for unlock user level
router.post("/unlock-level", requireSignIn, unlockLevel);

// get level
router.get("/get-level", requireSignIn, getLevelsByCurrency);

//get single
router.get("/user-level", requireSignIn, getCurrentUserLevel);

// Route to get user level by email (admin route)
router.get("/admin-level/:email", requireSignIn, isAdmin, getUserLevelByEmail);

// Route to get salary for current level of user
router.post("/claim-salary", requireSignIn, checkAndClaimSalary);

router.get("/getsalary", requireSignIn, getSalaryForCurrentLevel);
router.get("/salarystatus", requireSignIn, getSalaryClaimHistory);

router.get("/user/salary-details", requireSignIn, getUserSalaryDetails);

export default router;
