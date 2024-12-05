import { Router } from "express";
import {
  createProduct,
  getSellerAllProducts,
  getSpecificProduct,
  updateProduct,
  publishUnpublishProduct,
  deleteProductPermanently,
} from "../controllers/product.controller.js";

const router = Router();

// product routes
router.get("/products", getSellerAllProducts);
router.get("/product/:id", getSpecificProduct);
router.post("/product/create", createProduct);
router.post("/product/update/:id", updateProduct);
router.put("/product/update/publish/:id", publishUnpublishProduct);
router.delete("/product/delete/:id", deleteProductPermanently);

export default router;
