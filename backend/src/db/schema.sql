CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS tbl_organization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We alter the custom Better Auth 'tbl_user' table to link to organizations and assign RBAC roles
ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES tbl_organization(id) ON DELETE SET NULL;
ALTER TABLE tbl_user ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Developer';

-- 2. Repositories
CREATE TABLE IF NOT EXISTS tbl_repository (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES tbl_organization(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    git_url VARCHAR(512) NOT NULL,
    last_mined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Commits
CREATE TABLE IF NOT EXISTS tbl_commit_record (
    hash VARCHAR(40) PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES tbl_repository(id) ON DELETE CASCADE,
    author_email VARCHAR(255) NOT NULL,
    message TEXT,
    lines_added INTEGER DEFAULT 0,
    lines_deleted INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. Module Metrics (Features for AI)
CREATE TABLE IF NOT EXISTS tbl_module_metric (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES tbl_repository(id) ON DELETE CASCADE,
    file_path VARCHAR(512) NOT NULL,
    complexity_score NUMERIC(5,2) DEFAULT 0,
    churn_rate INTEGER DEFAULT 0,
    bug_frequency INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Predictions
CREATE TABLE IF NOT EXISTS tbl_ai_prediction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES tbl_module_metric(id) ON DELETE CASCADE,
    risk_score NUMERIC(5,4) NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    shap_values JSONB, 
    llm_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
