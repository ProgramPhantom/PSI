import { Router, json } from 'express';
import {deleteDiagram, getDateModified, getDiagramFile, postCreateDiagram, putSaveDiagram} from '../controllers/diagramsController.js';
import { diagramUpload } from '../middlewares/diagramUpload.js';

const router = Router();

router.delete('/:diagramId', deleteDiagram);
router.put('/:diagramId', diagramUpload.single('file'), putSaveDiagram)
router.get('/:diagramId', getDiagramFile)
router.get('/:diagramId/modified', getDateModified)
router.post('/', diagramUpload.single('file'), postCreateDiagram)

export default router;