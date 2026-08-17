import express from 'express';
import { scanBranchDiagnostics } from '../controllers/branchDiagnosticsController.js';

const router = express.Router();

router.post('/scan', scanBranchDiagnostics);

export default router;
