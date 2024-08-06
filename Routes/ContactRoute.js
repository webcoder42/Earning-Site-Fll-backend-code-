import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/UserMiddleware.js";
import {
  addContact,
  deleteContact,
  getContact,
} from "../Controller/ContactController.js";

const router = express.Router();

// Add a new announcement (Admin only)
router.post("/addcontact", requireSignIn, isAdmin, addContact);

router.get("/get-Contact", requireSignIn, getContact);

router.delete("/delete-Contact", requireSignIn, isAdmin, deleteContact);

export default router;
