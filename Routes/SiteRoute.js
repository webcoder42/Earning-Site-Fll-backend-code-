import express, { Router } from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  deleteTitleController,
  getAllTitlesController,
  getTitleController,
  titleController,
  updateTitleController,
} from "../Controller/titleController.js";

const router = express.Router();

//create title

router.post("/create-title", requireSignIn, isAdmin, titleController);

//delete title
router.delete(
  "/delete-title/:id",
  requireSignIn,
  isAdmin,
  deleteTitleController
);
//get all
router.get("/get-title", getAllTitlesController);

//get single title
router.get("/title/:slug", requireSignIn, isAdmin, getTitleController);

//update
router.put("/update-title/:id", requireSignIn, isAdmin, updateTitleController);
export default router;
