import { Router } from 'express';
import {
  getHelloWorld,
} from '../controllers/testController.js';

const router = Router();

router.get('/', getHelloWorld);

export default router;