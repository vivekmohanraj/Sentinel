import { getHotspots, seedOrRescanMetrics } from '../models/moduleMetricModel.js';

export const getHotspotsList = async (req, res, next) => {
  try {
    const { repoId } = req.query;
    const hotspots = await getHotspots(repoId);
    return res.status(200).json({
      success: true,
      data: hotspots
    });
  } catch (err) {
    next(err);
  }
};

export const rescanCodebase = async (req, res, next) => {
  try {
    const { repoId } = req.body || {};
    await seedOrRescanMetrics(repoId);
    const updatedHotspots = await getHotspots(repoId);

    return res.status(200).json({
      success: true,
      message: 'Codebase rescan and static AST complexity analysis completed.',
      data: updatedHotspots,
      timestamp: new Date()
    });
  } catch (err) {
    next(err);
  }
};
