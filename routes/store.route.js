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
import { isAuthenticated } from "../middlewares/authenticated.js";
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

// update the user address or create it
router.get("/user/:id", isAuthenticated, getUserData);
router.put("/user/address/:id", isAuthenticated, upsertUserAddress);

// order routes with authenticated users
router.post("/order/payment", isAuthenticated, createOrder);
router.post("/order/payment/verify", isAuthenticated, verifyPayment);
// ==============delete the order if payment fails
router.post("/order/payment/delete/:id", isAuthenticated, deleteOrder);

export default router;
