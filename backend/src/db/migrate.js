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

      -- Enforce Admin designation rule for vivekmohanraj5@gmail.com
      UPDATE tbl_user SET role = 'Admin' WHERE LOWER(email) = 'vivekmohanraj5@gmail.com';

      -- 2. Repositories
      CREATE TABLE IF NOT EXISTS tbl_repository (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          organization_id UUID REFERENCES tbl_organization(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          git_url VARCHAR(512) NOT NULL,
          last_mined_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure organization_id in tbl_repository is optional
      ALTER TABLE tbl_repository ALTER COLUMN organization_id DROP NOT NULL;

      -- 3. Commits
      CREATE TABLE IF NOT EXISTS tbl_commit_record (
          hash VARCHAR(40) PRIMARY KEY,
          repository_id UUID REFERENCES tbl_repository(id) ON DELETE CASCADE,
          author_email VARCHAR(255) NOT NULL,
          message TEXT,
          lines_added INTEGER DEFAULT 0,
          lines_deleted INTEGER DEFAULT 0,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL
      );

      -- 4. Module Metrics
      CREATE TABLE IF NOT EXISTS tbl_module_metric (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          repository_id UUID REFERENCES tbl_repository(id) ON DELETE CASCADE,
          file_path VARCHAR(512) NOT NULL,
          complexity_score NUMERIC(5,2) DEFAULT 0,
          churn_rate INTEGER DEFAULT 0,
          bug_frequency INTEGER DEFAULT 0,
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 5. AI Predictions
      CREATE TABLE IF NOT EXISTS tbl_ai_prediction (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          module_id UUID REFERENCES tbl_module_metric(id) ON DELETE CASCADE,
          risk_score NUMERIC(5,4) NOT NULL,
          prediction_type VARCHAR(100) NOT NULL,
          shap_values JSONB,
          llm_explanation TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Database] Migrations applied successfully.');
  } catch (err) {
    console.error('[Database] Migration error:', err.message);
  }
};
