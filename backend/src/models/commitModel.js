import pool from '../config/db.js';

export const getCommits = async ({ search = '', repoFilter = '', limit = 50 } = {}) => {
  let query = `
    SELECT c.hash, c.repository_id, c.author_email, c.message, c.lines_added, c.lines_deleted, c.timestamp, r.name as repo_name
    FROM tbl_commit_record c
    LEFT JOIN tbl_repository r ON c.repository_id = r.id
  `;
  const params = [];
  const whereConditions = [];

  if (search) {
    whereConditions.push(`(LOWER(c.message) LIKE LOWER($${params.length + 1}) OR LOWER(c.author_email) LIKE LOWER($${params.length + 1}) OR LOWER(c.hash) LIKE LOWER($${params.length + 1}))`);
    params.push(`%${search}%`);
  }

  if (repoFilter && repoFilter.trim()) {
    whereConditions.push(`(c.repository_id::text = $${params.length + 1} OR LOWER(r.name) = LOWER($${params.length + 1}))`);
    params.push(repoFilter.trim());
  }

  if (whereConditions.length > 0) {
    query += ` WHERE ` + whereConditions.join(' AND ');
  }

  query += ` ORDER BY c.timestamp DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
};

export const createCommitRecord = async ({ hash, repositoryId, authorEmail, message, linesAdded = 0, linesDeleted = 0, timestamp }) => {
  let targetRepoId = repositoryId;
  if (!targetRepoId) {
    const repoRes = await pool.query(`SELECT id FROM tbl_repository ORDER BY created_at DESC LIMIT 1`);
    targetRepoId = repoRes.rows[0]?.id || null;
  }

  const result = await pool.query(
    `INSERT INTO tbl_commit_record (hash, repository_id, author_email, message, lines_added, lines_deleted, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()))
     ON CONFLICT (hash) DO UPDATE SET
       message = EXCLUDED.message,
       lines_added = EXCLUDED.lines_added,
       lines_deleted = EXCLUDED.lines_deleted
     RETURNING hash, repository_id, author_email, message, lines_added, lines_deleted, timestamp`,
    [hash, targetRepoId, authorEmail, message, linesAdded, linesDeleted, timestamp]
  );
  return result.rows[0];
};
