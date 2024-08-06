import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  createAdvertisement,
  deleteAdvertisement,
  getAdvertisementById,
  getAdvertisements,
  updateAdvertisement,
} from "../Controller/AdvertisementController.js";

const router = express.Router();

//create ads
router.post(
  "/create-advertisement",
  requireSignIn,
  isAdmin,
  createAdvertisement
);
//get all
router.get("/get-all-ads", requireSignIn, getAdvertisements);

//get single
router.get("/get-single/:adId", requireSignIn, isAdmin, getAdvertisementById);

//update
router.put("/update/:adId", requireSignIn, isAdmin, updateAdvertisement);

//delete
router.delete("/delete/:adId", requireSignIn, isAdmin, deleteAdvertisement);

export default router;
