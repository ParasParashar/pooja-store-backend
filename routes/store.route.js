import { Router } from "express";
import {
  getProductDetails,
  getProducts,
} from "../controllers/store.controller.js";
import { upsertUserAddress } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/authenticated.js";
import { createOrder } from "../controllers/payment.controller.js";

const router = Router();

router.get("/products", getProducts);
router.get("/product/:id", getProductDetails);
// update the user address or create it
router.put("/user/address/:id", upsertUserAddress);

// order routes with authenticated users

router.post("/order/payment", isAuthenticated, createOrder);

export default router;
