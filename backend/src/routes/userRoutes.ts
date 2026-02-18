import { Router } from 'express';
import { getDiagrams, postLogin } from '../controllers/usersController.js';

const router = Router();

router.post('/login', postLogin)
router.get('/diagrams', getDiagrams)
export default router;