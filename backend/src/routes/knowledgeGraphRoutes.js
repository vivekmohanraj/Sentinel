import express from 'express';
import { getKnowledgeGraphTopology } from '../controllers/knowledgeGraphController.js';

const router = express.Router();

router.get('/topology', getKnowledgeGraphTopology);

export default router;
