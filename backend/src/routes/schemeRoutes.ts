import { Router } from 'express';
import { deleteScheme, saveScheme, loadScheme, createScheme } from '../controllers/schemeController.js';
import { schemeUpload } from '../middlewares/schemeUpload.js';
import { v7 as uuidv7 } from 'uuid';

const router = Router();

router.delete('/:schemeId', deleteScheme);
router.put('/:schemeId', schemeUpload.single('file'), saveScheme);
router.get('/:schemeId', loadScheme);
router.post('/:schemeId', schemeUpload.single('file'), createScheme);

export default router;
