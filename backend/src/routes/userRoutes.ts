import { Router } from 'express';
import { getDiagrams, getSchemes, getMe, postLogin, postLogout } from '../controllers/usersController.js';

const router = Router();

router.post('/login', postLogin)
router.post('/logout', postLogout)
router.get('/diagrams', getDiagrams)
router.get('/schemes', getSchemes)
router.get('/me', getMe)
export default router;