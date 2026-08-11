import {
  getDashboardSummary,
  getAllRepositories,
  createRepository,
  deleteRepository
} from '../models/dashboardModel.js';

export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

export const getRepos = async (req, res, next) => {
  try {
    const repos = await getAllRepositories();
    return res.status(200).json({
      success: true,
      data: repos
    });
  } catch (err) {
    next(err);
  }
};

export const addRepo = async (req, res, next) => {
  try {
    const { name, gitUrl } = req.body;
    if (!name || !gitUrl) {
      return res.status(400).json({ success: false, error: 'Repository name and Git URL are required.' });
    }
    const newRepo = await createRepository({ name, gitUrl });
    return res.status(201).json({
      success: true,
      data: newRepo
    });
  } catch (err) {
    next(err);
  }
};

export const removeRepo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteRepository(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Repository not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Repository deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
