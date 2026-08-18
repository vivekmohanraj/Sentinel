import {
  getAllOrganizations,
  createOrganization,
  deleteOrganization,
  getAllProjects,
  createProject,
  deleteProject
} from '../models/orgModel.js';
import { auth } from '../auth.js';

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
    const { name, creatorEmail } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Organization name is required.' });
    }

    let email = creatorEmail || req.query.email || null;
    let userId = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user) {
        email = session.user.email || email;
        userId = session.user.id || userId;
      }
    } catch (e) {}

    const newOrg = await createOrganization({ name, createdByUserId: userId, createdByEmail: email });
    return res.status(201).json({
      success: true,
      data: newOrg
    });
  } catch (err) {
    next(err);
  }
};

export const removeOrg = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteOrganization(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Organization not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Organization deleted successfully.'
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
    const { orgId, name, description, creatorEmail } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required.' });
    }

    let email = creatorEmail || req.query.email || null;
    let userId = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user) {
        email = session.user.email || email;
        userId = session.user.id || userId;
      }
    } catch (e) {}

    const newProject = await createProject({
      orgId,
      name,
      description,
      createdByUserId: userId,
      createdByEmail: email
    });
    return res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (err) {
    next(err);
  }
};

export const removeProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
