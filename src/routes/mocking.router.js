import { MockingController } from '../controller/mocking.controller.js';

import { Router } from 'express';
export const router=Router();

router.get('/', MockingController.mockingProducts);