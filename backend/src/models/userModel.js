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

  const displayName = user.name || `${firstName || ''} ${lastName || ''}`.trim() || user.email || 'User';
  const isSuperAdmin = user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const effectiveRole = isSuperAdmin ? 'Admin' : (user.role || 'Software Engineer (Developer)');

  let phone = user.phone || '';
  if (phone.includes('555')) {
    phone = '';
  }

  const avatarUrl = user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=b7f15b&color=223600&bold=true`;

  return {
    id: user.id,
    firstName: firstName || '',
    lastName: lastName || '',
    name: displayName,
    email: user.email,
    phone: phone,
    role: effectiveRole,
    image: avatarUrl,
    organizationId: user.organization_id || null,
    weeklyReports: user.weekly_reports !== false,
    githubSync: user.github_sync !== false,
    isDisabled: user.is_disabled === true,
    createdAt: user.createdAt || user.created_at
  };
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"
     FROM tbl_user
     WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"
     FROM tbl_user
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getLatestUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" DESC
     LIMIT 1`
  );
  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"
     FROM tbl_user
     ORDER BY "createdAt" DESC`
  );
  return result.rows.map(formatUserRow);
};

export const getUserDetailedProfile = async (targetUserId) => {
  const user = await getUserById(targetUserId);
  if (!user) return null;

  // 1. Query Organizations Created By or Associated With this User
  const orgsRes = await pool.query(
    `SELECT o.id, o.name, o.created_by_user_id, o.created_by_email, o.created_at,
            COUNT(DISTINCT p.id)::int as projects_count,
            COUNT(DISTINCT r.id)::int as repos_count
     FROM tbl_organization o
     LEFT JOIN tbl_project p ON p.organization_id = o.id
     LEFT JOIN tbl_repository r ON r.organization_id = o.id OR r.project_id = p.id
     WHERE o.created_by_user_id = $1 
        OR LOWER(o.created_by_email) = LOWER($2)
        OR ($3::uuid IS NOT NULL AND o.id = $3)
     GROUP BY o.id, o.name, o.created_by_user_id, o.created_by_email, o.created_at
     ORDER BY o.created_at DESC`,
    [user.id, user.email, user.organizationId]
  );
  const organizations = orgsRes.rows || [];

  // 2. Query Projects Created By or Associated With this User
  const projectsRes = await pool.query(
    `SELECT p.id, p.organization_id, p.name, p.description, p.created_by_user_id, p.created_by_email, p.created_at,
            o.name as org_name,
            COUNT(DISTINCT r.id)::int as repos_count
     FROM tbl_project p
     LEFT JOIN tbl_organization o ON p.organization_id = o.id
     LEFT JOIN tbl_repository r ON r.project_id = p.id
     WHERE p.created_by_user_id = $1 
        OR LOWER(p.created_by_email) = LOWER($2)
        OR ($3::uuid IS NOT NULL AND p.organization_id = $3)
     GROUP BY p.id, p.organization_id, p.name, p.description, p.created_by_user_id, p.created_by_email, p.created_at, o.name
     ORDER BY p.created_at DESC`,
    [user.id, user.email, user.organizationId]
  );
  const projects = projectsRes.rows || [];

  // 3. Query Repositories Created By, Connected, or Assigned to this User
  const reposRes = await pool.query(
    `SELECT r.id, r.name, r.git_url, r.project_id, r.organization_id, r.created_by_user_id, r.created_by_email, r.created_at, r.last_mined_at,
            p.name as project_name, o.name as org_name,
            COUNT(DISTINCT c.hash)::int as commits_count
     FROM tbl_repository r
     LEFT JOIN tbl_project p ON r.project_id = p.id
     LEFT JOIN tbl_organization o ON r.organization_id = o.id OR p.organization_id = o.id
     LEFT JOIN tbl_commit_record c ON c.repository_id = r.id
     WHERE r.created_by_user_id = $1 
        OR LOWER(r.created_by_email) = LOWER($2)
        OR ($3::uuid IS NOT NULL AND r.organization_id = $3)
     GROUP BY r.id, r.name, r.git_url, r.project_id, r.organization_id, r.created_by_user_id, r.created_by_email, r.created_at, r.last_mined_at, p.name, o.name
     ORDER BY r.created_at DESC`,
    [user.id, user.email, user.organizationId]
  );
  const repositories = reposRes.rows || [];

  const orgName = organizations.length > 0 ? organizations[0].name : (user.organizationId ? 'Assigned Organization' : 'Unassigned Organization');
  const projectName = projects.length > 0 ? projects[0].name : 'Unassigned Project';

  // 4. Developer Commit History & Activity Metrics
  const commitsRes = await pool.query(
    `SELECT c.hash, c.repository_id, c.author_email, c.message, c.lines_added, c.lines_deleted, c.timestamp, r.name as repo_name
     FROM tbl_commit_record c
     LEFT JOIN tbl_repository r ON c.repository_id = r.id
     WHERE LOWER(c.author_email) = LOWER($1) 
        OR LOWER(c.author_email) LIKE LOWER($2)
     ORDER BY c.timestamp DESC`,
    [user.email, `%${user.email.split('@')[0]}%`]
  );

  const commits = commitsRes.rows || [];
  const totalCommits = commits.length;
  const totalLinesAdded = commits.reduce((acc, c) => acc + (c.lines_added || 0), 0);
  const totalLinesDeleted = commits.reduce((acc, c) => acc + (c.lines_deleted || 0), 0);
  const netChurn = totalLinesAdded - totalLinesDeleted;

  return {
    user,
    organizationName: orgName,
    projectName: projectName,
    organizations,
    projects,
    repositories,
    metrics: {
      totalCommits,
      totalLinesAdded,
      totalLinesDeleted,
      netChurn,
      orgsCount: organizations.length,
      projectsCount: projects.length,
      reposCount: repositories.length
    },
    recentCommits: commits
  };
};

export const updateUserRoleByAdmin = async (userId, newRole) => {
  const targetUser = await getUserById(userId);
  if (targetUser && targetUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    newRole = 'Admin';
  }

  const result = await pool.query(
    `UPDATE tbl_user
     SET role = $1,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"`,
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

  const insertRes = await pool.query(
    `INSERT INTO tbl_user (id, name, email, role, first_name, last_name, is_disabled, "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"`,
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
     RETURNING id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"`,
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
  const { firstName, lastName, email, phone, role, image, weeklyReports, githubSync } = data;
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
      `INSERT INTO tbl_user (id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"`,
      [
        fullName || targetEmail,
        targetEmail,
        image || null,
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
         image = COALESCE($7, image),
         weekly_reports = $8,
         github_sync = $9,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $10 OR LOWER(email) = LOWER($4)
     RETURNING id, name, email, image, role, first_name, last_name, phone, weekly_reports, github_sync, is_disabled, organization_id, "createdAt"`,
    [
      firstName,
      lastName,
      fullName,
      targetEmail,
      phone,
      assignedRole,
      image || null,
      weeklyReports !== false,
      githubSync !== false,
      existing.id
    ]
  );

  if (result.rows.length === 0) return null;
  return formatUserRow(result.rows[0]);
};
