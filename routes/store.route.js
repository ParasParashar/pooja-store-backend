import { Router } from "express";
import {
  createOrder,
  getProductDetails,
  getProducts,
} from "../controllers/store.controller.js";
import { upsertUserAddress } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/authenticated.js";

const router = Router();

router.get("/products", getProducts);
router.get("/product/:id", getProductDetails);
// update the user address or create it
router.put("/users/address/:id", upsertUserAddress);

// order routes with authenticated users

router.post("/order", isAuthenticated, createOrder);

export default router;
