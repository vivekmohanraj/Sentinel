import express from 'express';
import {
  getOrgs,
  addOrg,
  removeOrg,
  getProjects,
  addProject,
  removeProject
} from '../controllers/orgController.js';

const router = express.Router();

router.get('/orgs', getOrgs);
router.post('/orgs', addOrg);
router.delete('/orgs/:id', removeOrg);
router.get('/projects', getProjects);
router.post('/projects', addProject);
router.delete('/projects/:id', removeProject);

export default router;
