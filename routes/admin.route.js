import { Router } from "express";
import {
  createProduct,
  getSpecificProduct,
  updateProduct,
  getAllProducts,
  deleteProductPermanently,
} from "../controllers/product.controller.js";

const router = Router();

// product routes
router.get("/products", getAllProducts);
router.get("/product/:id", getSpecificProduct);
router.post("/product/create", createProduct);
router.post("/product/update/:id", updateProduct);
// router.put("/product/update/publish/:id", publishUnpublishProduct);
router.delete("/product/delete/:id", deleteProductPermanently);

export default router;
