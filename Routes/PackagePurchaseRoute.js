import express from "express";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";
import {
  createCommissionController,
  getAllTransactionController,
  // getSingleController,
  getUserMembershipController,
  packagePurchaseController,
  updateStatusController,
} from "../Controller/purchasepackageController.js";

const router = express.Router();

// Purchase package route
router.post("/purchasepackage", requireSignIn, packagePurchaseController);

//get single by user

//router.get("/active", requireSignIn, getSingleController);

//get all transaction
router.get(
  "/get-all-tarnsaction",
  requireSignIn,

  getAllTransactionController
);

//update status
router.put(
  "/update-status/:packageId",
  requireSignIn,
  isAdmin,
  updateStatusController
);
//get single ho kar raha ha na
router.get("/membership", requireSignIn, getUserMembershipController);

export default router;
