import express from "express";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";
import { imageController } from "../Controller/SliderImgController.js";
import Formidable from "express-formidable";

const router = express.Router();

//post
router.post("/image", requireSignIn, isAdmin, Formidable(), imageController);

export default router;
