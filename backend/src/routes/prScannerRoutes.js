import express from 'express';
import { simulatePullRequestScan } from '../controllers/prScannerController.js';

const router = express.Router();

router.post('/scan', simulatePullRequestScan);

export default router;
