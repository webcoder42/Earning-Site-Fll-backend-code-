// routes/commissionRoutes.js
import express from "express";
import { requireSignIn } from "./../middleware/UserMiddleware.js";
import { addCommissionOnPackageActivation } from "../Controller/CommissionController.js";

const router = express.Router();

router.post(
  "/add-commission/:userId",
  requireSignIn,
  addCommissionOnPackageActivation
);

export default router;
