import express from 'express';
import { getRiskRadar, scanPullRequest } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/risk-radar', getRiskRadar);
router.post('/scan-pr', scanPullRequest);

export default router;
