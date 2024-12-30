import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createLongearn,
  deleteLongearn,
  getlongearn,
  getlongearnById,
  updateLongearn,
} from "../Controller/LongEarnController.js";

const router = express.Router();

router.post("/create-longads", requireSignIn, isAdmin, createLongearn);
//get all
router.get("/get-ads", requireSignIn, getlongearn);

//get single
router.get("/get-single/:adId", requireSignIn, isAdmin, getlongearnById);

//update
router.put("/update/:adId", requireSignIn, isAdmin, updateLongearn);

//delete
router.delete("/delete/:adId", requireSignIn, isAdmin, deleteLongearn);

export default router;
