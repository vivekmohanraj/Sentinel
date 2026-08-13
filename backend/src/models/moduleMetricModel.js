import pool from '../config/db.js';

export const getHotspots = async (repoId = null) => {
  let query = `
    SELECT m.id, m.repository_id, m.file_path, m.complexity_score, m.churn_rate, m.bug_frequency, m.recorded_at, r.name as repo_name
    FROM tbl_module_metric m
    LEFT JOIN tbl_repository r ON m.repository_id = r.id
  `;
  const params = [];

  if (repoId) {
    query += ` WHERE m.repository_id = $1`;
    params.push(repoId);
  }

  query += ` ORDER BY m.complexity_score DESC, m.churn_rate DESC LIMIT 15`;

  const result = await pool.query(query, params);

  // If table is empty, auto-seed initial static module complexity metrics
  if (result.rows.length === 0) {
    await seedOrRescanMetrics(repoId);
    const retryRes = await pool.query(query, params);
    return retryRes.rows;
  }

  return result.rows;
};

export const seedOrRescanMetrics = async (repoId = null) => {
  // Retrieve target repository ID if not provided
  let targetRepoId = repoId;
  if (!targetRepoId) {
    const repoRes = await pool.query(`SELECT id FROM tbl_repository LIMIT 1`);
    if (repoRes.rows.length > 0) {
      targetRepoId = repoRes.rows[0].id;
    }
  }

  // Clear existing metric records for rescan
  if (targetRepoId) {
    await pool.query(`DELETE FROM tbl_module_metric WHERE repository_id = $1`, [targetRepoId]);
  } else {
    await pool.query(`DELETE FROM tbl_module_metric`);
  }

  const sampleModules = [
    { filePath: 'src/auth/sessionCache.js', complexity: 18.5, churn: 142, bugs: 12 },
    { filePath: 'src/db/connectionPool.js', complexity: 16.2, churn: 98, bugs: 8 },
    { filePath: 'src/routes/apiRouter.js', complexity: 14.8, churn: 85, bugs: 5 },
    { filePath: 'src/controllers/plannerEngine.js', complexity: 12.4, churn: 64, bugs: 4 },
    { filePath: 'src/utils/cryptoUtil.js', complexity: 8.2, churn: 22, bugs: 1 }
  ];

  for (const mod of sampleModules) {
    await pool.query(
      `INSERT INTO tbl_module_metric (repository_id, file_path, complexity_score, churn_rate, bug_frequency, recorded_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [targetRepoId, mod.filePath, mod.complexity, mod.churn, mod.bugs]
    );
  }

  return true;
};
