import pool from '../config/db.js';
import { auth } from '../auth.js';

export const ADMIN_EMAIL = 'vivekmohanraj5@gmail.com';

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
    isDisabled: user.is_disabled === true,
    createdAt: user.createdAt || user.created_at
  };
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"
     FROM tbl_user
     WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"
     FROM tbl_user
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getLatestUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" DESC
     LIMIT 1`
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"
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
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"`,
    [newRole, userId]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const createUserByAdmin = async ({ name, email, password, role }) => {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('A user with this email address already exists.');
  }

  const isSuperAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const assignedRole = isSuperAdmin ? 'Admin' : (role || 'Software Engineer (Developer)');

  const parts = (name || '').trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  // Try creating credentials account via Better Auth API
  try {
    const signupRes = await auth.api.signUpEmail({
      body: { name, email, password }
    });

    if (signupRes?.user?.id) {
      await pool.query(
        `UPDATE tbl_user
         SET role = $1, first_name = $2, last_name = $3, is_disabled = false
         WHERE id = $4`,
        [assignedRole, firstName, lastName, signupRes.user.id]
      );
      return await getUserById(signupRes.user.id);
    }
  } catch (authErr) {
    console.log('[Admin Create User] Better Auth signup API fallback:', authErr.message);
  }

  // Fallback direct database insertion if auth API handles custom signup
  const insertRes = await pool.query(
    `INSERT INTO tbl_user (id, name, email, role, first_name, last_name, is_disabled, "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"`,
    [name, email, assignedRole, firstName, lastName]
  );
  return formatUserRow(insertRes.rows[0]);
};

export const toggleUserDisableByAdmin = async (userId, isDisabled) => {
  const targetUser = await getUserById(userId);
  if (!targetUser) throw new Error('User not found.');

  if (targetUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Super Admin account cannot be disabled.');
  }

  const result = await pool.query(
    `UPDATE tbl_user
     SET is_disabled = $1,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"`,
    [isDisabled === true, userId]
  );
  return formatUserRow(result.rows[0]);
};

export const deleteUserByAdmin = async (userId) => {
  const targetUser = await getUserById(userId);
  if (!targetUser) throw new Error('User not found.');

  if (targetUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Super Admin account cannot be deleted.');
  }

  await pool.query(`DELETE FROM tbl_user WHERE id = $1`, [userId]);
  return true;
};

export const updateUserProfile = async (identifier, data) => {
  const { firstName, lastName, email, phone, role, weeklyReports, githubSync } = data;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const targetEmail = email || identifier;
  const isSuperAdmin = targetEmail && targetEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const assignedRole = isSuperAdmin ? 'Admin' : (role || 'Software Engineer (Developer)');

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
    const insertRes = await pool.query(
      `INSERT INTO tbl_user (id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"`,
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
     RETURNING id, name, email, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt"`,
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
