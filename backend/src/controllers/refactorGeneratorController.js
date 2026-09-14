import pool from '../config/db.js';

export const generateRefactoringSnippet = async (req, res, next) => {
  try {
    const { filePath, complexityScore } = req.body;
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'filePath parameter is required.' });
    }

    // 1. Query real module metrics from PostgreSQL database
    const dbRes = await pool.query(
      `SELECT file_path, complexity_score, churn_rate, bug_frequency FROM tbl_module_metric WHERE file_path = $1 OR file_path LIKE $2 LIMIT 1`,
      [filePath, `%${filePath.split('/').pop()}`]
    );

    const metric = dbRes.rows[0] || {
      complexity_score: complexityScore || 12.0,
      churn_rate: 0,
      bug_frequency: 0
    };

    const baseName = filePath.split('/').pop();
    const extension = baseName.includes('.') ? baseName.split('.').pop().toLowerCase() : '';
    const currentScore = parseFloat(metric.complexity_score || 12.0);
    const churn = parseInt(metric.churn_rate || 0, 10);
    const bugs = parseInt(metric.bug_frequency || 0, 10);

    const targetScore = parseFloat(Math.max(1.0, currentScore * 0.62).toFixed(1));
    const riskReductionPct = Math.min(65, Math.max(15, Math.round(((currentScore - targetScore) / Math.max(1, currentScore)) * 100)));

    let fileCategory = 'Source Code Module';
    let designPattern = 'Service Facade Decomposition';
    let diagnosticSummary = '';
    let recommendedActions = [];

    if (['json', 'yml', 'yaml', 'toml', 'env'].includes(extension)) {
      fileCategory = 'Structured Data / Configuration';
      designPattern = 'Schema Normalization & Entity Separation';
      diagnosticSummary = `The configuration/data file '${baseName}' has undergone ${churn} revisions with a metric weight of ${currentScore.toFixed(1)}. Monolithic data stores create merge conflicts and single points of coupling.`;
      recommendedActions = [
        'Break monolithic configuration or data records into modular schema-validated sub-files.',
        'Implement static schema validation (such as Zod or JSON Schema) to prevent runtime data corruption.',
        'Isolate environment-specific overrides into dedicated environment variables or config providers.',
        'Add automated validation tests in CI to verify schema compliance before deployment.'
      ];
    } else if (baseName.toLowerCase().includes('pool') || baseName.toLowerCase().includes('db') || extension === 'sql') {
      fileCategory = 'Database / Data Access Layer';
      designPattern = 'Repository Pattern & Connection Facade';
      diagnosticSummary = `Data access module '${baseName}' exhibits a cyclomatic complexity of ${currentScore.toFixed(1)} across ${churn} historical revisions and ${bugs} defect reports.`;
      recommendedActions = [
        'Encapsulate raw SQL queries inside dedicated Repository methods.',
        'Extract connection pooling, transaction lifecycles, and error handlers into reusable middleware.',
        'Implement parameterized query wrappers to prevent SQL injection vulnerabilities.',
        'Create localized integration unit tests for database transactions and connection failovers.'
      ];
    } else if (baseName.toLowerCase().includes('router') || baseName.toLowerCase().includes('api') || baseName.toLowerCase().includes('controller')) {
      fileCategory = 'API / Route Controller Layer';
      designPattern = 'Middleware Decoupling & Request Validation';
      diagnosticSummary = `Controller/Route file '${baseName}' has a cyclomatic score of ${currentScore.toFixed(1)} with ${churn} mined edits, indicating concentrated procedural routing logic.`;
      recommendedActions = [
        'Extract business validation rules out of route controllers into dedicated validator middleware.',
        'Delegate domain business logic and calculations to isolated Service classes or utility helpers.',
        'Normalize HTTP error responses using a centralized Express error handling middleware.',
        'Write end-to-end endpoint integration tests covering both 200 OK and 4xx/5xx failure branches.'
      ];
    } else {
      fileCategory = 'Business Logic Module';
      designPattern = 'Extract Service Facade & Single-Responsibility Methods';
      diagnosticSummary = `Source module '${baseName}' has high branching density (complexity ${currentScore.toFixed(1)}) and ${churn} Git edits. Refactoring reduces cyclomatic complexity down to ${targetScore.toFixed(1)}.`;
      recommendedActions = [
        'Decompose multi-branch functions into smaller single-responsibility helper functions.',
        'Replace deeply nested if/else logic with guard clauses or strategy patterns.',
        'Extract external side-effects (file I/O, network calls) behind abstract interfaces.',
        'Establish automated unit test coverage across all conditional branches prior to refactoring.'
      ];
    }

    return res.status(200).json({
      success: true,
      data: {
        filePath,
        fileName: baseName,
        fileExtension: extension ? `.${extension}` : 'file',
        fileCategory,
        currentComplexity: currentScore,
        targetComplexity: targetScore,
        churnRate: churn,
        bugFrequency: bugs,
        riskReductionPercent: riskReductionPct,
        designPattern,
        advisorySummary: diagnosticSummary,
        recommendedActions,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
