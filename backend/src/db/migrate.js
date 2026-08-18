import pool from '../config/db.js';

export const runMigrations = async () => {
  try {
    console.log('[Database] Checking & applying schema migrations...');
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- 1. Organizations
      CREATE TABLE IF NOT EXISTS tbl_organization (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add custom profile fields to tbl_user
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES tbl_organization(id) ON DELETE SET NULL;
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Software Engineer (Developer)';
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS weekly_reports BOOLEAN DEFAULT true;
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS github_sync BOOLEAN DEFAULT true;
      ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

      -- Enforce Admin designation rule for vivekmohanraj5@gmail.com
      UPDATE tbl_user SET role = 'Admin' WHERE LOWER(email) = 'vivekmohanraj5@gmail.com';

      -- 2. Projects (Organization -> Project Hierarchy)
      CREATE TABLE IF NOT EXISTS tbl_project (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          organization_id UUID REFERENCES tbl_organization(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Repositories
      CREATE TABLE IF NOT EXISTS tbl_repository (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          organization_id UUID REFERENCES tbl_organization(id) ON DELETE CASCADE,
          project_id UUID REFERENCES tbl_project(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          git_url VARCHAR(512) NOT NULL,
          last_mined_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure organization_id in tbl_repository is optional
      ALTER TABLE tbl_repository ALTER COLUMN organization_id DROP NOT NULL;
      ALTER TABLE tbl_repository ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES tbl_project(id) ON DELETE CASCADE;

      -- Add creator attribution columns across organizations, projects, and repositories
      ALTER TABLE tbl_organization ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
      ALTER TABLE tbl_organization ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255);

      ALTER TABLE tbl_project ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
      ALTER TABLE tbl_project ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255);

      ALTER TABLE tbl_repository ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
      ALTER TABLE tbl_repository ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255);

      -- 4. Commits
      CREATE TABLE IF NOT EXISTS tbl_commit_record (
          hash VARCHAR(40) PRIMARY KEY,
          repository_id UUID REFERENCES tbl_repository(id) ON DELETE CASCADE,
          author_email VARCHAR(255) NOT NULL,
          message TEXT,
          lines_added INTEGER DEFAULT 0,
          lines_deleted INTEGER DEFAULT 0,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL
      );

      -- 5. Module Metrics
      CREATE TABLE IF NOT EXISTS tbl_module_metric (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          repository_id UUID REFERENCES tbl_repository(id) ON DELETE CASCADE,
          file_path VARCHAR(512) NOT NULL,
          complexity_score NUMERIC(5,2) DEFAULT 0,
          churn_rate INTEGER DEFAULT 0,
          bug_frequency INTEGER DEFAULT 0,
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. AI Predictions
      CREATE TABLE IF NOT EXISTS tbl_ai_prediction (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          module_id UUID REFERENCES tbl_module_metric(id) ON DELETE CASCADE,
          risk_score NUMERIC(5,4) NOT NULL,
          prediction_type VARCHAR(100) NOT NULL,
          shap_values JSONB,
          llm_explanation TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 7. System Notifications
      CREATE TABLE IF NOT EXISTS tbl_notification (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id TEXT REFERENCES tbl_user(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL DEFAULT 'INFO',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default notification for Admin user if table is empty
    const notifCount = await pool.query(`SELECT COUNT(*) FROM tbl_notification`);
    if (parseInt(notifCount.rows[0].count, 10) === 0) {
      const adminUser = await pool.query(`SELECT id FROM tbl_user WHERE LOWER(email) = 'vivekmohanraj5@gmail.com' LIMIT 1`);
      const userId = adminUser.rows.length > 0 ? adminUser.rows[0].id : null;

      await pool.query(`
        INSERT INTO tbl_notification (user_id, type, title, message, is_read)
        VALUES 
          ($1, 'SECURITY', 'Super Admin Activated', 'Super Admin privileges permanently active for vivekmohanraj5@gmail.com.', false),
          ($1, 'INFO', 'Sentinel Command Center Live', 'Air-gapped telemetry and PostgreSQL knowledge graph initialized.', false),
          ($1, 'WARN', 'High Churn Alert', 'Developer context switching churn detected in auth module session verification.', false)
      `, [userId]);
    }

    // Cleanup fake Sentinel repository
    await pool.query(`
      DELETE FROM tbl_repository 
      WHERE (LOWER(name) = 'sentinel' AND git_url = 'https://github.com/vivekmohanraj/Sentinel')
         OR (LOWER(name) = 'sentinel/core-engine');
    `);

    // Deduplicate repositories with same name (keep newest)
    await pool.query(`
      DELETE FROM tbl_repository
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(name) ORDER BY created_at DESC) as rnum
          FROM tbl_repository
        ) t
        WHERE t.rnum > 1
      );
    `);

    // Cleanup legacy dummy projects
    await pool.query(`
      DELETE FROM tbl_project 
      WHERE LOWER(name) IN ('sentinel core', 'sentinel/core-engine', 'diagram-design', 'sentinel core engine v2')
        AND id NOT IN (SELECT DISTINCT project_id FROM tbl_repository WHERE project_id IS NOT NULL);
    `);

    // Cleanup legacy dummy organizations
    await pool.query(`
      DELETE FROM tbl_organization 
      WHERE LOWER(name) = 'sentinel core org'
        AND id NOT IN (SELECT DISTINCT organization_id FROM tbl_project WHERE organization_id IS NOT NULL);
    `);

    console.log('[Database] Migrations and repository/project/org cleanup applied successfully.');
  } catch (err) {
    console.error('[Database] Migration error:', err.message);
  }
};
