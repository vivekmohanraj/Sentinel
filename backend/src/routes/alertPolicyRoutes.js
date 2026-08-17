import express from 'express';
import { getAlertPolicies, updateAlertPolicy } from '../controllers/alertPolicyController.js';

const router = express.Router();

router.get('/', getAlertPolicies);
router.post('/', updateAlertPolicy);

export default router;
