import { Router } from "express";
import {
  getProductDetails,
  getProducts,
} from "../controllers/store.controller.js";
import {
  upsertUserAddress,
  getUserData,
  getCartData,
} from "../controllers/user.controller.js";
import { authenticateJWT } from "../middlewares/authenticated.js";
import {
  createOrder,
  verifyPayment,
  deleteOrder,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductDetails);

// cart
router.post("/products/cart", getCartData);

// // update the user address or create it
// router.get("/user/:id", isAuthenticated, getUserData);
// router.put("/user/address/:id", isAuthenticated, upsertUserAddress);

// // order routes with authenticated users
// router.post("/order/payment", isAuthenticated, createOrder);
// router.post("/order/payment/verify", isAuthenticated, verifyPayment);
// // ==============delete the order if payment fails
// router.delete("/order/payment/delete/:id", isAuthenticated, deleteOrder);
// update the user address or create it
router.get("/user/:id", authenticateJWT, getUserData);
router.put("/user/address/:id", authenticateJWT, upsertUserAddress);

// order routes with authenticated users
router.post("/order/payment", authenticateJWT, createOrder);
router.post("/order/payment/verify", authenticateJWT, verifyPayment);
// ==============delete the order if payment fails
router.delete("/order/payment/delete/:id", authenticateJWT, deleteOrder);

export default router;
