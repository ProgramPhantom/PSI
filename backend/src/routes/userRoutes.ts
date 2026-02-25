import { Router } from 'express';
import { getDiagrams, getMe, postLogin } from '../controllers/usersController.js';

const router = Router();

router.post('/login', postLogin)
router.get('/diagrams', getDiagrams)
router.get('/getMe', getMe)
export default router;