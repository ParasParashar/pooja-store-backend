// import { Router } from "express";
// import passport from "passport";
// import { getSellerDetails, logout } from "../controllers/auth.controller.js";
// import dotenv from "dotenv";
// const router = Router();
// dotenv.config();
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: [
//       "https://www.googleapis.com/auth/userinfo.profile",
//       "https://www.googleapis.com/auth/userinfo.email",
//     ],
//   })
// );
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: process.env.FRONTEND_URL,
//     failureRedirect: "/",
//   })
// );

// router.get("/me", getSellerDetails);
// router.post("/logout", logout);
// export default router;
import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";
const router = Router();
dotenv.config();
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = req.user.token;
    console.log("token value of the  user: " + token);
    res.cookie("jwt", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.FRONTEND_URL);
  }
);

export default router;
