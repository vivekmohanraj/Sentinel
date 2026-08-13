import express from 'express';
import { listCommits, addCommit } from '../controllers/commitController.js';

const router = express.Router();

router.get('/', listCommits);
router.post('/', addCommit);

export default router;
