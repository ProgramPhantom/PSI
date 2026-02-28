import { Router } from 'express';
import { deleteScheme, saveScheme, loadScheme, createScheme } from '../controllers/schemeController.js';

const router = Router();

router.delete('/:schemeId', deleteScheme);
router.put('/:schemeId', saveScheme);
router.get('/:schemeId', loadScheme);
router.post('/', createScheme);

export default router;
