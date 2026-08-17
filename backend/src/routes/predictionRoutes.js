import express from 'express';
import { getRiskRadar, scanPullRequest, explainAstFactors } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/risk-radar', getRiskRadar);
router.post('/scan-pr', scanPullRequest);
router.post('/ast-explain', explainAstFactors);
router.post('/shap-explain', explainAstFactors); // Alias for backward compatibility

export default router;
