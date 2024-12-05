import { Router } from "express";
import {
  getCollections,
  getProductDetails,
} from "../controllers/store.controller.js";
import { upsertUserAddress } from "../controllers/user.controller.js";

const router = Router();

router.get("/collections", getCollections);
router.get("/product/:id", getProductDetails);
// update the user address or create it
router.put("/users/address/:id", upsertUserAddress);

export default router;
