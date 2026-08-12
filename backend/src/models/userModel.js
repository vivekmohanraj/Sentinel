import pool from '../config/db.js';

export const ADMIN_EMAIL = 'vivekmohanraj5@gmail.com';

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getLatestUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" DESC
     LIMIT 1`
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" DESC`
  );
  return result.rows.map(formatUserRow);
};

export const updateUserRoleByAdmin = async (userId, newRole) => {
  // Disallow demoting vivekmohanraj5@gmail.com from Admin
  const targetUser = await getUserById(userId);
  if (targetUser && targetUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    newRole = 'Admin';
  }

  const result = await pool.query(
    `UPDATE tbl_user
     SET role = $1,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"`,
    [newRole, userId]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

const formatUserRow = (user) => {
  let firstName = user.first_name;
  let lastName = user.last_name;

  if (!firstName && user.name) {
    const parts = user.name.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || '';
  }

  // Strict Admin Rule: vivekmohanraj5@gmail.com is strictly Admin
  const isSuperAdmin = user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const effectiveRole = isSuperAdmin ? 'Admin' : (user.role || 'Software Engineer (Developer)');

  return {
    id: user.id,
    firstName: firstName || '',
    lastName: lastName || '',
    name: user.name || `${firstName || ''} ${lastName || ''}`.trim(),
    email: user.email,
    phone: user.phone || '',
    role: effectiveRole,
    weeklyReports: user.weekly_reports !== false,
    githubSync: user.github_sync !== false,
    createdAt: user.createdAt
  };
};

export const updateUserProfile = async (identifier, data) => {
  const { firstName, lastName, email, phone, role, weeklyReports, githubSync } = data;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const targetEmail = email || identifier;
  const isSuperAdmin = targetEmail && targetEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const assignedRole = isSuperAdmin ? 'Admin' : (role || 'Software Engineer (Developer)');

  // Check if user exists by ID or email
  let existing = null;
  if (identifier && identifier.includes('@')) {
    existing = await getUserByEmail(identifier);
  } else if (identifier) {
    existing = await getUserById(identifier);
  }

  if (!existing && targetEmail) {
    existing = await getUserByEmail(targetEmail);
  }

  if (!existing) {
    // Insert new profile if user record doesn't exist yet
    const insertRes = await pool.query(
      `INSERT INTO tbl_user (id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"`,
      [
        fullName || targetEmail,
        targetEmail,
        assignedRole,
        firstName,
        lastName,
        phone,
        weeklyReports !== false,
        githubSync !== false
      ]
    );
    return formatUserRow(insertRes.rows[0]);
  }

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
     WHERE id = $9 OR LOWER(email) = LOWER($4)
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, "createdAt"`,
    [
      firstName,
      lastName,
      fullName,
      targetEmail,
      phone,
      assignedRole,
      weeklyReports !== false,
      githubSync !== false,
      existing.id
    ]
  );

  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};
