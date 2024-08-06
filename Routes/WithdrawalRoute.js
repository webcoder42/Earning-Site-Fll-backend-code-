import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  PhotoController,
  createAccountController,
  deleteController,
  getSingleAccountController,
  getWithdrawalController,
  updateController,
} from "../Controller/WithdrawalController.js";
import Formidable from "express-formidable";

const router = express.Router();

//post
router.post(
  "/create-account",
  requireSignIn,
  isAdmin,
  Formidable(),
  createAccountController
);

//get all
router.get("/get-withdrawal-account", requireSignIn, getWithdrawalController);

//get single
router.get(
  "/get-single-account/:id",
  requireSignIn,

  getSingleAccountController
);

//Get Photo Product
router.get("/account-photo/:pid", PhotoController);

//update
router.put("/update-account/:id", requireSignIn, isAdmin, updateController);

//delete
router.delete("/delete-account/:id", requireSignIn, isAdmin, deleteController);

export default router;
