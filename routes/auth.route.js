import { Router } from "express";
import passport from "passport";
import { getSellerDetails, logout } from "../controllers/auth.controller.js";
import dotenv from "dotenv";
const router = Router();
dotenv.config();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_url,
    failureRedirect: "/",
  })
);

router.get("/me", getSellerDetails);
router.post("/logout", logout);
export default router;
