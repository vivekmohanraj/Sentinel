import pool from '../config/db.js';

const initAlertPolicyTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tbl_alert_policy (
      id VARCHAR(64) PRIMARY KEY,
      key VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      threshold_value VARCHAR(64) NOT NULL,
      severity VARCHAR(32) NOT NULL,
      enabled BOOLEAN DEFAULT true,
      description TEXT
    );
  `);

  const countRes = await pool.query(`SELECT COUNT(*) FROM tbl_alert_policy`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const defaultPolicies = [
      { id: 'pol-1', key: 'complexityThreshold', name: 'Module Cyclomatic Complexity Alert', threshold_value: '15.0', severity: 'HIGH', enabled: true, description: 'Triggers critical alert when file complexity exceeds score 15.0' },
      { id: 'pol-2', key: 'busFactorThreshold', name: 'Bus Factor Ownership Alert', threshold_value: '80%', severity: 'CRITICAL', enabled: true, description: 'Alerts when a single maintainer authors over 80% of module commits' },
      { id: 'pol-3', key: 'churnVolumeThreshold', name: 'Sprint Line Churn Volume Alert', threshold_value: '500 lines', severity: 'ELEVATED', enabled: true, description: 'Alerts when net line additions in sprint exceed 500 lines' },
      { id: 'pol-4', key: 'coChangeCouplingThreshold', name: 'Co-Change Temporal Coupling Alert', threshold_value: '65%', severity: 'MEDIUM', enabled: true, description: 'Alerts on high co-change coupling between decoupled modules' }
    ];

    for (const p of defaultPolicies) {
      await pool.query(
        `INSERT INTO tbl_alert_policy (id, key, name, threshold_value, severity, enabled, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.key, p.name, p.threshold_value, p.severity, p.enabled, p.description]
      );
    }
  }
};

export const getAlertPolicies = async (req, res, next) => {
  try {
    await initAlertPolicyTable();
    const result = await pool.query(
      `SELECT id, key, name, threshold_value as "thresholdValue", severity, enabled, description FROM tbl_alert_policy ORDER BY id`
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const updateAlertPolicy = async (req, res, next) => {
  try {
    await initAlertPolicyTable();
    const { policies = [] } = req.body;

    for (const p of policies) {
      if (p.id) {
        await pool.query(
          `UPDATE tbl_alert_policy
           SET threshold_value = $1, enabled = $2
           WHERE id = $3`,
          [p.thresholdValue || p.threshold_value || '15.0', p.enabled !== false, p.id]
        );
      }
    }

    const updatedRes = await pool.query(
      `SELECT id, key, name, threshold_value as "thresholdValue", severity, enabled, description FROM tbl_alert_policy ORDER BY id`
    );

    return res.status(200).json({
      success: true,
      message: 'Alert policy thresholds updated successfully in PostgreSQL database.',
      data: updatedRes.rows
    });
  } catch (err) {
    next(err);
  }
};
