import pool from '../config/db.js';

export const getAllOrganizations = async () => {
  const result = await pool.query(
    `SELECT id, name, created_at FROM tbl_organization ORDER BY created_at ASC`
  );
  return result.rows;
};

export const createOrganization = async ({ name, createdByUserId = null, createdByEmail = null }) => {
  const result = await pool.query(
    `INSERT INTO tbl_organization (name, created_by_user_id, created_by_email)
     VALUES ($1, $2, $3)
     RETURNING id, name, created_by_user_id, created_by_email, created_at`,
    [name.trim(), createdByUserId, createdByEmail]
  );
  const newOrg = result.rows[0];

  // If created by a user who has no organization_id assigned, set it to the newly created org
  if (createdByEmail || createdByUserId) {
    try {
      await pool.query(
        `UPDATE tbl_user 
         SET organization_id = $1 
         WHERE (LOWER(email) = LOWER($2) OR id = $3) AND organization_id IS NULL`,
        [newOrg.id, createdByEmail || '', createdByUserId || '']
      );
    } catch (e) {
      console.warn('[Org Model] User org association notice:', e.message);
    }
  }

  return newOrg;
};

export const deleteOrganization = async (orgId) => {
  const result = await pool.query(
    `DELETE FROM tbl_organization WHERE id = $1 RETURNING id`,
    [orgId]
  );
  return result.rows[0];
};

export const getAllProjects = async () => {
  const result = await pool.query(
    `SELECT p.id, p.organization_id, p.name, p.description, p.created_by_user_id, p.created_by_email, p.created_at, o.name as org_name
     FROM tbl_project p
     LEFT JOIN tbl_organization o ON p.organization_id = o.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

export const createProject = async ({ orgId, name, description, createdByUserId = null, createdByEmail = null }) => {
  let targetOrgId = orgId;
  if (!targetOrgId) {
    const orgs = await getAllOrganizations();
    if (orgs.length > 0) {
      targetOrgId = orgs[0].id;
    } else {
      const err = new Error('An existing organization is required to create a project.');
      err.statusCode = 400;
      throw err;
    }
  }

  const result = await pool.query(
    `INSERT INTO tbl_project (organization_id, name, description, created_by_user_id, created_by_email)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, organization_id, name, description, created_by_user_id, created_by_email, created_at`,
    [targetOrgId, name.trim(), description || '', createdByUserId, createdByEmail]
  );
  return result.rows[0];
};

export const deleteProject = async (projectId) => {
  const result = await pool.query(
    `DELETE FROM tbl_project WHERE id = $1 RETURNING id`,
    [projectId]
  );
  return result.rows[0];
};
