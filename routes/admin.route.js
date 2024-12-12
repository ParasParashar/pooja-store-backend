import { Router } from "express";
import {
  createProduct,
  getSpecificProduct,
  updateProduct,
  getAllProducts,
  deleteProductPermanently,
  publishUnpublishProduct,
} from "../controllers/product.controller.js";
import {
  getAllOrders,
  updateOrderDeliveryStatus,
} from "../controllers/order.controller.js";

const router = Router();

// product routes
router.get("/products", getAllProducts);
router.get("/product/:id", getSpecificProduct);
router.post("/product/create", createProduct);
router.post("/product/update/:id", updateProduct);
router.put("/product/publish/:id", publishUnpublishProduct);
router.delete("/product/delete/:id", deleteProductPermanently);

// orders routes
router.get("/orders", getAllOrders);
router.put("/order/update/:id", updateOrderDeliveryStatus);

export default router;
