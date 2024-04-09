import { Router } from "express";
import { ProductsController } from "../controller/products.controller.js";
import { isAdminOrPremium } from "../config/config.auten.autoriz.js";
export const router=Router();


router.post('/', isAdminOrPremium, ProductsController.createProduct);
router.put('/:pid', isAdminOrPremium, ProductsController.updateProduct);
router.delete('/:pid', isAdminOrPremium, ProductsController.deleteProduct);

