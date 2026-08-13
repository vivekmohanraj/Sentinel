import express from 'express';
import {
  getOrgs,
  addOrg,
  getProjects,
  addProject
} from '../controllers/orgController.js';

const router = express.Router();

router.get('/orgs', getOrgs);
router.post('/orgs', addOrg);
router.get('/projects', getProjects);
router.post('/projects', addProject);

export default router;
