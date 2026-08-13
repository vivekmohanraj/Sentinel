import pool from '../config/db.js';

export const getCommits = async ({ search = '', repoFilter = '', limit = 50 } = {}) => {
  // Check if tbl_commit_record has entries; if empty, seed default commits
  const countRes = await pool.query(`SELECT COUNT(*) FROM tbl_commit_record`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const repoRes = await pool.query(`SELECT id FROM tbl_repository LIMIT 1`);
    const repoId = repoRes.rows.length > 0 ? repoRes.rows[0].id : null;

    await pool.query(`
      INSERT INTO tbl_commit_record (hash, repository_id, author_email, message, lines_added, lines_deleted, timestamp)
      VALUES
        ('8f4b308e9a2b1c4d', $1, 'vivekmohanraj5@gmail.com', 'feat(root): implement admin rbac, repository crud, and structural ui design rules', 475, 31, NOW() - INTERVAL '2 hours'),
        ('33726bd7c1f82e0a', $1, 'vivekmohanraj5@gmail.com', 'feat(root): add system telemetry inspection and executive csv report export engine', 339, 4, NOW() - INTERVAL '1 hour'),
        ('7b5408c1d5e9a40b', $1, 'vivekmohanraj5@gmail.com', 'fix(frontend): redesign toggle switches and fix header element alignment', 28, 28, NOW() - INTERVAL '45 minutes'),
        ('24e3a3c9b4e10a2f', $1, 'vivekmohanraj5@gmail.com', 'feat(root): implement organization and project management hierarchy', 358, 35, NOW() - INTERVAL '20 minutes'),
        ('0f16727a8b3c1d4e', $1, 'vivekmohanraj5@gmail.com', 'feat(root): implement system notifications and interactive alert center drawer', 337, 2, NOW() - INTERVAL '5 minutes')
      ON CONFLICT (hash) DO NOTHING
    `, [repoId]);
  }

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

  if (repoFilter) {
    whereConditions.push(`(c.repository_id::text = $${params.length + 1} OR LOWER(r.name) = LOWER($${params.length + 1}))`);
    params.push(repoFilter);
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
  const result = await pool.query(
    `INSERT INTO tbl_commit_record (hash, repository_id, author_email, message, lines_added, lines_deleted, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()))
     ON CONFLICT (hash) DO UPDATE SET
       message = EXCLUDED.message,
       lines_added = EXCLUDED.lines_added,
       lines_deleted = EXCLUDED.lines_deleted
     RETURNING hash, repository_id, author_email, message, lines_added, lines_deleted, timestamp`,
    [hash, repositoryId, authorEmail, message, linesAdded, linesDeleted, timestamp]
  );
  return result.rows[0];
};
