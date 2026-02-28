import { Router } from 'express';
import { deleteScheme, saveScheme, loadScheme, createScheme } from '../controllers/schemeController.js';
import { schemeUpload } from '../middlewares/schemeUpload.js';

const router = Router();

router.delete('/:schemeId', deleteScheme);
router.put('/:schemeId', schemeUpload.single('file'), saveScheme);
router.get('/:schemeId', loadScheme);
router.post('/', createScheme);

export default router;
