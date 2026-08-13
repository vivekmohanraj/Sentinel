import { getRiskRadarPredictions, createPRPrediction } from '../models/predictionModel.js';

export const getRiskRadar = async (req, res, next) => {
  try {
    const { repoName, repoId } = req.query;
    const predictions = await getRiskRadarPredictions(repoName || repoId);
    return res.status(200).json({
      success: true,
      data: predictions
    });
  } catch (err) {
    next(err);
  }
};

export const scanPullRequest = async (req, res, next) => {
  try {
    const prData = req.body || {};
    const created = await createPRPrediction(prData);
    return res.status(201).json({
      success: true,
      message: 'Pull request defect risk scan completed.',
      data: created
    });
  } catch (err) {
    next(err);
  }
};
