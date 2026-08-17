import pool from '../config/db.js';
import { initializeDefaultRepository, extractRealModuleMetrics } from './dashboardModel.js';

export const getHotspots = async (repoFilter = null) => {
  let query = `
    SELECT m.id, m.repository_id, m.file_path, m.complexity_score, m.churn_rate, m.bug_frequency, m.recorded_at, r.name as repo_name
    FROM tbl_module_metric m
    LEFT JOIN tbl_repository r ON m.repository_id = r.id
  `;
  const params = [];

  if (repoFilter) {
    query += ` WHERE m.repository_id::text = $1 OR LOWER(r.name) = LOWER($1)`;
    params.push(repoFilter);
  }

  query += ` ORDER BY m.complexity_score DESC, m.churn_rate DESC LIMIT 15`;

  const result = await pool.query(query, params);

  // If table is empty, seed real workspace module complexity metrics
  if (result.rows.length === 0) {
    await seedOrRescanMetrics(repoFilter);
    const retryRes = await pool.query(query, params);
    return retryRes.rows;
  }

  return result.rows;
};

export const seedOrRescanMetrics = async (repoFilter = null) => {
  let targetRepoId = null;

  if (repoFilter) {
    const repoRes = await pool.query(
      `SELECT id, name FROM tbl_repository WHERE id::text = $1 OR LOWER(name) = LOWER($1) LIMIT 1`,
      [repoFilter]
    );
    if (repoRes.rows.length > 0) {
      targetRepoId = repoRes.rows[0].id;
    }
  }

  if (!targetRepoId) {
    const repoRes = await pool.query(`SELECT id, name FROM tbl_repository LIMIT 1`);
    if (repoRes.rows.length > 0) {
      targetRepoId = repoRes.rows[0].id;
    } else {
      targetRepoId = await initializeDefaultRepository();
    }
  }

  if (targetRepoId) {
    await pool.query(`DELETE FROM tbl_module_metric WHERE repository_id = $1`, [targetRepoId]);
    const realMetrics = extractRealModuleMetrics();

    for (const mod of realMetrics) {
      await pool.query(
        `INSERT INTO tbl_module_metric (repository_id, file_path, complexity_score, churn_rate, bug_frequency, recorded_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [targetRepoId, mod.file_path, mod.complexity_score, mod.churn_rate, mod.bug_frequency]
      );
    }
  }

  return true;
};
