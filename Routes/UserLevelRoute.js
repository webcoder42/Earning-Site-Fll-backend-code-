import express from "express";
import {
  //checkSalaryOnLevelUnlock,
  //claimSalary,
  getCurrentUserLevel,
  getLevelsByCurrency,
  //getSalaryForCurrentLevel,
  unlockLevel,
} from "../Controller/UserLevelController.js";
import { requireSignIn } from "./../middleware/UserMiddleware.js";

const router = express.Router();

// Route for unlock user level
router.post("/unlock-level", requireSignIn, unlockLevel);

// get level
router.get("/get-level", requireSignIn, getLevelsByCurrency);

//get single
router.get("/user-level", requireSignIn, getCurrentUserLevel);

// Route to get salary for current level of user
//router.get("/salary", requireSignIn, getSalaryForCurrentLevel);

// Route to check and increment salary on level unlock
//router.post("/salary-level-unlock", requireSignIn, checkSalaryOnLevelUnlock);

// Route for salary claim
//router.post("/salary/claim", requireSignIn, claimSalary);

export default router;
