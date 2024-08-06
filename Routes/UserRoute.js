import express, { Router } from "express";
import {
  PasswordResetController,
  ProfileController,
  allUserController,
  loginController,
  registerController,
  requestPasswordResetController,
  testController,
  updatePasswordController,
  getTotalUsersCount,
  getEarningSlug,
  searchController,
  getTotalReferrals,
  getRefferalCodeController,
  getRefferallinkCodeController,
} from "../Controller/UserController.js";
import { isAdmin, requireSignIn } from "../middleware/UserMiddleware.js";

const router = express.Router();

//Registration route
router.post("/register", registerController);

//Login Route
router.post("/login", loginController);

router.post("/request-resetpassword-", requestPasswordResetController);

// Reset password route

router.post("/request-password-reset/:token", PasswordResetController);

//update profile
router.put("/update-profile", requireSignIn, ProfileController);

//password change
router.put("/change-password", requireSignIn, updatePasswordController);

//protected user route
router.get("/auth-user", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected user route
router.get(
  "/auth-admin",

  requireSignIn,
  isAdmin,
  (req, res) => {
    res.status(200).send({ ok: true });
  }
);

//Get all user
router.get("/all-user", requireSignIn, allUserController);

//totel count user
router.get("/total-users", requireSignIn, isAdmin, getTotalUsersCount);

//total single user earning earning
router.get("/earnings", requireSignIn, getEarningSlug);

//test route
router.get("/test", requireSignIn, isAdmin, testController);

// Route to get total referrals for a user
router.get("/total-referrals", requireSignIn, getTotalReferrals);

//get refferal
router.get("/get-refferalcode", requireSignIn, getRefferalCodeController);

//get
router.get("/get-refferallink", requireSignIn, getRefferallinkCodeController);

//search
router.get("/users/search", requireSignIn, isAdmin, searchController);

export default router;
