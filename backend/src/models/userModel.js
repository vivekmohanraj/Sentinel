import pool from '../config/db.js';

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  let firstName = user.first_name;
  let lastName = user.last_name;

  if (!firstName && user.name) {
    const parts = user.name.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || '';
  }

  return {
    id: user.id,
    firstName: firstName || 'Sarah',
    lastName: lastName || 'Dev',
    name: user.name || `${firstName || 'Sarah'} ${lastName || 'Dev'}`,
    email: user.email,
    phone: user.phone || '+1 (555) 234-8901',
    role: user.role || 'Engineering Manager (Project owner)',
    weeklyReports: user.weekly_reports !== false,
    githubSync: user.github_sync !== false,
    createdAt: user.createdAt
  };
};

export const getFirstUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" ASC
     LIMIT 1`
  );
  if (result.rows.length === 0) return null;
  return getUserById(result.rows[0].id);
};

export const updateUserProfile = async (userId, data) => {
  const { firstName, lastName, email, phone, role, weeklyReports, githubSync } = data;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const result = await pool.query(
    `UPDATE tbl_user
     SET first_name = $1,
         last_name = $2,
         name = $3,
         email = $4,
         phone = $5,
         role = $6,
         weekly_reports = $7,
         github_sync = $8,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync`,
    [
      firstName,
      lastName,
      fullName,
      email,
      phone,
      role || 'Engineering Manager (Project owner)',
      weeklyReports !== false,
      githubSync !== false,
      userId
    ]
  );

  if (result.rows.length === 0) return null;
  const updated = result.rows[0];

  return {
    id: updated.id,
    firstName: updated.first_name,
    lastName: updated.last_name,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    weeklyReports: updated.weekly_reports,
    githubSync: updated.github_sync
  };
};
