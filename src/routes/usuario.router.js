import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller.js';
import { isUsuario } from '../config/config.auten.autoriz.js';



export const router=Router()

router.post('/consultasWs', isUsuario, UsuarioController.consultasWs);
router.post('/premium/:cid', UsuarioController.cambiarUsuario);
router.get('/user/:cid',UsuarioController.buscarUsuario);
router.post('/recupero01', UsuarioController.recuperoPassword01);
router.post('/recupero03', UsuarioController.recuperoPassword03);
router.post('/:cid/documents',UsuarioController.uploadDocuments); 
// router.post('/:cid/productImage',UsuarioController.uploadProductImage);
// router.post('/:cid/profileImage', UsuarioController.uploadProfile);