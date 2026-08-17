import express from 'express';
import { getRiskRadar, scanPullRequest, explainShapVector } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/risk-radar', getRiskRadar);
router.post('/scan-pr', scanPullRequest);
router.post('/shap-explain', explainShapVector);

export default router;
