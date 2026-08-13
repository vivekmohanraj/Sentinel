import { getCommits, createCommitRecord } from '../models/commitModel.js';

export const listCommits = async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    const commits = await getCommits({ search, limit: limit ? parseInt(limit, 10) : 50 });
    return res.status(200).json({
      success: true,
      data: commits
    });
  } catch (err) {
    next(err);
  }
};

export const addCommit = async (req, res, next) => {
  try {
    const { hash, repositoryId, authorEmail, message, linesAdded, linesDeleted, timestamp } = req.body;
    if (!hash || !authorEmail || !message) {
      return res.status(400).json({ success: false, error: 'Commit hash, author email, and message are required.' });
    }
    const created = await createCommitRecord({ hash, repositoryId, authorEmail, message, linesAdded, linesDeleted, timestamp });
    return res.status(201).json({
      success: true,
      data: created
    });
  } catch (err) {
    next(err);
  }
};
