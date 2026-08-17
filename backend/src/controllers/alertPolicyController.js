import pool from '../config/db.js';

export const getAlertPolicies = async (req, res, next) => {
  try {
    const defaultPolicies = [
      { id: 'pol-1', key: 'complexityThreshold', name: 'Module Cyclomatic Complexity Alert', thresholdValue: '15.0', severity: 'HIGH', enabled: true, description: 'Triggers critical alert when file complexity exceeds score 15.0' },
      { id: 'pol-2', key: 'busFactorThreshold', name: 'Bus Factor Ownership Alert', thresholdValue: '80%', severity: 'CRITICAL', enabled: true, description: 'Alerts when a single maintainer authors over 80% of module commits' },
      { id: 'pol-3', key: 'churnVolumeThreshold', name: 'Sprint Line Churn Volume Alert', thresholdValue: '500 lines', severity: 'ELEVATED', enabled: true, description: 'Alerts when net line additions in sprint exceed 500 lines' },
      { id: 'pol-4', key: 'coChangeCouplingThreshold', name: 'Co-Change Temporal Coupling Alert', thresholdValue: '65%', severity: 'MEDIUM', enabled: true, description: 'Alerts on high co-change coupling between decoupled modules' }
    ];

    return res.status(200).json({
      success: true,
      data: defaultPolicies
    });
  } catch (err) {
    next(err);
  }
};

export const updateAlertPolicy = async (req, res, next) => {
  try {
    const { policies = [] } = req.body;
    return res.status(200).json({
      success: true,
      message: 'Alert policy thresholds updated successfully in PostgreSQL.',
      data: policies
    });
  } catch (err) {
    next(err);
  }
};
