import { Router } from 'express';
import {
  listen,
} from '../controllers/testController.js';

const router = Router();

router.all('/listen*', listen);

export default router;