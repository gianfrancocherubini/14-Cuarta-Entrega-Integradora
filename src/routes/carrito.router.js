import { Router } from 'express';
import { isUsuario } from '../config/config.auten.autoriz.js';
import { CarritoController } from '../controller/carrito.controller.js';
export const router=Router()

router.post('/:cid/purchase', CarritoController.purchaseTicket);
router.post('/', CarritoController.createCart);
router.post('/:cid/product/:pid', isUsuario, CarritoController.addProductToCart);
router.delete('/:cid/product/:pid', CarritoController.deleteProductToCart);
router.delete('/:cid', CarritoController.deletedCart);

