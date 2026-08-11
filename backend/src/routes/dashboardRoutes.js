import express from 'express';
import {
  getSummary,
  getRepos,
  addRepo,
  removeRepo
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/repositories', getRepos);
router.post('/repositories', addRepo);
router.delete('/repositories/:id', removeRepo);

export default router;
