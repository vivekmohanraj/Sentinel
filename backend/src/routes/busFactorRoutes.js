import express from 'express';
import { getBusFactorMetrics } from '../controllers/busFactorController.js';

const router = express.Router();

router.get('/bus-factor', getBusFactorMetrics);

export default router;
