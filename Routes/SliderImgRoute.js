import express from "express";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";

import Formidable from "express-formidable";
import { imageController } from "./../Controller/SliderImgController.js";

const router = express.Router();

//post
router.post("/image", requireSignIn, isAdmin, Formidable(), imageController);

export default router;
