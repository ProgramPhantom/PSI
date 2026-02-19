import { Router, json } from 'express';
import {deleteDiagram, getDateModified, getLoadDiagram, postCreateDiagram, putSaveDiagram} from '../controllers/diagramsController.js';

const router = Router();

router.delete('/:diagramId', deleteDiagram);
router.put('/:diagramId', putSaveDiagram)
router.get('/:diagramId', getLoadDiagram)
router.get('/:diagramId/modified', getDateModified)
router.post('/', postCreateDiagram)

export default router;