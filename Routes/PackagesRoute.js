import express, { Router } from "express";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";
import {
  createPackageController,
  deletePackageController,
  getAllPackageController,
  singlePackageController,
  updatePackageController,
} from "../Controller/PackageController.js";

const router = express.Router();

//create package
router.post("/create-package", requireSignIn, isAdmin, createPackageController);

//get all package
router.get("/all-package", requireSignIn, getAllPackageController);

// Get single package by slug
router.get("/single-package/:slug", requireSignIn, singlePackageController);

//delete packges
router.delete(
  "/delete-package/:pid",
  requireSignIn,
  isAdmin,
  deletePackageController
);

//update package
router.put(
  "/update-package/:pid",
  requireSignIn,
  isAdmin,

  updatePackageController
);

export default router;
