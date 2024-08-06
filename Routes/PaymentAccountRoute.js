import express, { Router } from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  accountController,
  deleteAccountController,
  getAccountController,
  getAllAccountController,
  updateAccountController,
} from "../Controller/PaymentAccountController.js";

const router = express.Router();

//create paymen method
router.post("/payment-account", requireSignIn, isAdmin, accountController);

//get single payment
router.get("/get-account/:id", requireSignIn, getAccountController);

//get all
router.get("/get-all", requireSignIn, getAllAccountController);

//update account
router.put(
  "/update-account/:id",
  requireSignIn,
  isAdmin,
  updateAccountController
);

//delete account
router.delete(
  "/delete-account/:id",
  requireSignIn,
  isAdmin,
  deleteAccountController
);

export default router;
