import express from "express";
import {
  getLevelsByCurrency,
  unlockLevel,
} from "../Controller/UserLevelController.js";
import { requireSignIn } from "./../middleware/UserMiddleware.js";

const router = express.Router();

// Route for upgrading user level
router.post("/upgrade-level", requireSignIn, unlockLevel);

// get level
router.get("/get-level", requireSignIn, getLevelsByCurrency);

export default router;
