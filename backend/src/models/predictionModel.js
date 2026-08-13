import pool from '../config/db.js';

export const getRiskRadarPredictions = async () => {
  const result = await pool.query(
    `SELECT p.id, p.module_id, p.risk_score, p.prediction_type, p.shap_values, p.llm_explanation, p.created_at
     FROM tbl_ai_prediction p
     ORDER BY p.risk_score DESC, p.created_at DESC`
  );

  // If table is empty, auto-seed initial static PR risk radar predictions
  if (result.rows.length === 0) {
    await seedInitialPRPredictions();
    const retryRes = await pool.query(
      `SELECT p.id, p.module_id, p.risk_score, p.prediction_type, p.shap_values, p.llm_explanation, p.created_at
       FROM tbl_ai_prediction p
       ORDER BY p.risk_score DESC, p.created_at DESC`
    );
    return retryRes.rows.map(formatPredictionRow);
  }

  return result.rows.map(formatPredictionRow);
};

export const seedInitialPRPredictions = async () => {
  // Get an active module metric ID or null
  const modRes = await pool.query(`SELECT id FROM tbl_module_metric LIMIT 1`);
  const moduleId = modRes.rows.length > 0 ? modRes.rows[0].id : null;

  const initialPRs = [
    {
      riskScore: 0.84,
      predictionType: 'CRITICAL',
      shapValues: {
        pr: 'PR #402',
        title: 'Refactor auth token lifecycle & middleware guard',
        author: '@sarah_dev',
        modules: ['src/auth/session.ts', 'src/middleware/guard.ts']
      },
      explanation: 'High context-switching churn (+420 lines). Untested boundary path density in token refresh handler.'
    },
    {
      riskScore: 0.72,
      predictionType: 'WARNING',
      shapValues: {
        pr: 'PR #398',
        title: 'Add async Stripe webhook reconciliation queue',
        author: '@alex_m',
        modules: ['src/api/payment_gateway.go']
      },
      explanation: 'Async webhook reconciliation accumulated 14 conditional branches without isolated unit test assertions.'
    },
    {
      riskScore: 0.48,
      predictionType: 'ELEVATED',
      shapValues: {
        pr: 'PR #385',
        title: 'Optimize user session caching eviction index',
        author: '@david_k',
        modules: ['src/db/migrations/v4.sql']
      },
      explanation: 'Tight coupling between Redis cache eviction and SQL migration dependency graph.'
    }
  ];

  for (const item of initialPRs) {
    await pool.query(
      `INSERT INTO tbl_ai_prediction (module_id, risk_score, prediction_type, shap_values, llm_explanation, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [moduleId, item.riskScore, item.predictionType, JSON.stringify(item.shapValues), item.explanation]
    );
  }

  return true;
};

const formatPredictionRow = (row) => {
  let shap = row.shap_values || {};
  if (typeof shap === 'string') {
    try {
      shap = JSON.parse(shap);
    } catch (e) {
      shap = {};
    }
  }

  const scorePct = Math.round(parseFloat(row.risk_score || 0) * 100);

  return {
    id: row.id,
    pr: shap.pr || 'PR #100',
    title: shap.title || 'Pull Request Risk Analysis',
    author: shap.author || '@developer',
    score: scorePct,
    level: row.prediction_type || (scorePct >= 75 ? 'CRITICAL' : scorePct >= 60 ? 'WARNING' : 'ELEVATED'),
    reason: row.llm_explanation || 'Code complexity and churn density risk flagged.',
    modules: shap.modules || ['src/core/engine.js'],
    createdAt: row.created_at
  };
};

export const createPRPrediction = async (prData) => {
  const modRes = await pool.query(`SELECT id FROM tbl_module_metric LIMIT 1`);
  const moduleId = modRes.rows.length > 0 ? modRes.rows[0].id : null;

  const score = prData.score ? prData.score / 100 : 0.75;
  const level = prData.level || (score >= 0.75 ? 'CRITICAL' : 'WARNING');

  const shapValues = {
    pr: prData.pr || `PR #${Math.floor(Math.random() * 900) + 100}`,
    title: prData.title || 'Static Analysis Defect Risk Scan',
    author: prData.author || '@developer',
    modules: prData.modules || ['src/core/app.js']
  };

  const insertRes = await pool.query(
    `INSERT INTO tbl_ai_prediction (module_id, risk_score, prediction_type, shap_values, llm_explanation, created_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING id, module_id, risk_score, prediction_type, shap_values, llm_explanation, created_at`,
    [moduleId, score, level, JSON.stringify(shapValues), prData.reason || 'Static defect density flagged.']
  );

  return formatPredictionRow(insertRes.rows[0]);
};
