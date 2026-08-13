import express from 'express';
import { getHotspotsList, rescanCodebase } from '../controllers/moduleMetricController.js';

const router = express.Router();

router.get('/hotspots', getHotspotsList);
router.post('/rescan', rescanCodebase);

export default router;
