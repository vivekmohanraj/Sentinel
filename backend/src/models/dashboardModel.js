import pool from '../config/db.js';

export const getDashboardSummary = async () => {
  try {
    const reposRes = await pool.query(`SELECT COUNT(*) FROM tbl_repository`);
    const metricsRes = await pool.query(`SELECT COUNT(*) FROM tbl_module_metric`);

    return {
      healthScore: 78,
      healthScoreChange: 4.2,
      sprintRiskProbability: 76,
      estimatedDelayDays: 2.5,
      analyzedPRsCount: 4281,
      knowledgeGraphStatus: 'GRAPH INDEX UP TO DATE',
      aiReasoning: 'High risk of delay in auth module driven by excessive developer context-switching and complex tangled commits over the last 48 hours.',
      shapAttributions: [
        { name: 'Developer Context Switching Churn', impact: '+34% SHAP Impact', score: 84 },
        { name: 'Tangled Commits & High Cyclomatic Delta', impact: '+28% SHAP Impact', score: 68 },
        { name: 'Untested Boundary Path Density', impact: '+18% SHAP Impact', score: 45 }
      ],
      highRiskModules: [
        { path: 'src/auth/session.ts', riskScore: 84, churnLevel: 'High Churn (+420 lines)', status: 'Critical' },
        { path: 'src/api/payment_gateway.go', riskScore: 72, churnLevel: 'Unresolved State Retry', status: 'Warning' },
        { path: 'src/engine/planner.rs', riskScore: 61, churnLevel: 'Complex Cyclomatic Growth', status: 'Elevated' },
        { path: 'src/db/migrations/v4.sql', riskScore: 48, churnLevel: 'Schema Coupling Impact', status: 'Moderate' }
      ],
      techDebtHotspots: [
        { title: 'Auth & Caching Tight Coupling', couplingIndex: '7.4 / 10 (HIGH)', description: 'Tangled imports between session verification and cache eviction logic are driving 62% of refactoring friction.' },
        { title: 'Payment Gateway Branching', complexityChurn: '+18% This Sprint', description: 'Async webhook reconciliation handler has accumulated 14 conditional branches without isolated unit tests.' },
        { title: 'Extract Middleware Interface', refactoringPriority: 'Recommended', description: 'Decoupling JWT token lifecycle will reduce predicted release risk for Sprint 43 by an estimated 32%.' }
      ]
    };
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    throw err;
  }
};

export const getAllRepositories = async () => {
  const result = await pool.query(
    `SELECT id, name, git_url, last_mined_at, created_at FROM tbl_repository ORDER BY created_at DESC`
  );
  return result.rows;
};

export const createRepository = async ({ name, gitUrl }) => {
  const result = await pool.query(
    `INSERT INTO tbl_repository (name, git_url, last_mined_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     RETURNING id, name, git_url, last_mined_at, created_at`,
    [name, gitUrl]
  );
  return result.rows[0];
};

export const deleteRepository = async (id) => {
  const result = await pool.query(`DELETE FROM tbl_repository WHERE id = $1 RETURNING id`, [id]);
  return result.rows.length > 0;
};
