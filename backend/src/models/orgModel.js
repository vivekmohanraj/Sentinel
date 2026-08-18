import pool from '../config/db.js';

export const getAllOrganizations = async () => {
  const result = await pool.query(
    `SELECT id, name, created_at FROM tbl_organization ORDER BY created_at ASC`
  );
  return result.rows;
};

export const createOrganization = async ({ name }) => {
  const result = await pool.query(
    `INSERT INTO tbl_organization (name)
     VALUES ($1)
     RETURNING id, name, created_at`,
    [name.trim()]
  );
  return result.rows[0];
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
    `SELECT p.id, p.organization_id, p.name, p.description, p.created_at, o.name as org_name
     FROM tbl_project p
     LEFT JOIN tbl_organization o ON p.organization_id = o.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

export const createProject = async ({ orgId, name, description }) => {
  let targetOrgId = orgId;
  if (!targetOrgId) {
    const orgs = await getAllOrganizations();
    if (orgs.length > 0) {
      targetOrgId = orgs[0].id;
    } else {
      const defaultOrg = await createOrganization({ name: 'Engineering Workspace' });
      targetOrgId = defaultOrg.id;
    }
  }

  const result = await pool.query(
    `INSERT INTO tbl_project (organization_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, organization_id, name, description, created_at`,
    [targetOrgId, name.trim(), description || '']
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
