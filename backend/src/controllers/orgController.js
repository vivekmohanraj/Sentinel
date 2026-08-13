import {
  getAllOrganizations,
  createOrganization,
  getAllProjects,
  createProject
} from '../models/orgModel.js';

export const getOrgs = async (req, res, next) => {
  try {
    const orgs = await getAllOrganizations();
    return res.status(200).json({
      success: true,
      data: orgs
    });
  } catch (err) {
    next(err);
  }
};

export const addOrg = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Organization name is required.' });
    }
    const newOrg = await createOrganization({ name });
    return res.status(201).json({
      success: true,
      data: newOrg
    });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

export const addProject = async (req, res, next) => {
  try {
    const { orgId, name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required.' });
    }
    const newProject = await createProject({ orgId, name, description });
    return res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (err) {
    next(err);
  }
};
