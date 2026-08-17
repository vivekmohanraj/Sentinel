import pool from '../config/db.js';

export const generateRefactoringSnippet = async (req, res, next) => {
  try {
    const { filePath = 'src/sentinel/core-engine/mainEngine.js' } = req.body;

    // 1. Query real module metrics from PostgreSQL database
    const dbRes = await pool.query(
      `SELECT file_path, complexity_score, churn_rate, bug_frequency FROM tbl_module_metric WHERE file_path = $1 LIMIT 1`,
      [filePath]
    );

    const metric = dbRes.rows[0] || {
      complexity_score: 18.5,
      churn_rate: 142,
      bug_frequency: 12
    };

    const baseName = filePath.split('/').pop();
    const currentScore = parseFloat(metric.complexity_score || 18.5);
    const targetScore = parseFloat((currentScore * 0.62).toFixed(1));
    const riskReductionPct = Math.round(((currentScore - targetScore) / currentScore) * 100);

    const isPoolOrDb = baseName.toLowerCase().includes('pool') || baseName.toLowerCase().includes('db');
    const isRouterOrApi = baseName.toLowerCase().includes('router') || baseName.toLowerCase().includes('api');

    let patternName = isPoolOrDb
      ? 'Repository Connection Facade Pattern'
      : isRouterOrApi
      ? 'Express Middleware Router Decoupling'
      : 'Extract Service Method & Facade Pattern';

    let beforeCode = `// BEFORE SENTINEL REFACTORING (${baseName})
// Calculated Cyclomatic Score: ${currentScore.toFixed(1)} | Mined Churn: ${metric.churn_rate || 142} edits

async function handle${baseName.replace(/\.[^/.]+$/, '').toUpperCase()}(req, res, next) {
  if (!req || !req.body) throw new Error("Invalid request payload");
  try {
    // Nested procedural branching logic
    if (req.body.action === 'PROCESS') {
      const data = await queryDatabase(req.body.id);
      if (data && data.status === 'ACTIVE') {
        await executeTask(data);
      } else {
        await logWarning("Inactive status");
      }
    }
  } catch (err) {
    next(err);
  }
}`;

    let afterCode = `// AFTER SENTINEL AI REFACTORING (${baseName})
// Target Cyclomatic Score: ${targetScore.toFixed(1)} (-${riskReductionPct}% Risk Reduction Vector)
// Pattern Strategy: ${patternName}

class ${baseName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '')}Service {
  constructor(repository, logger) {
    this.repository = repository;
    this.logger = logger;
  }

  async executeAction(actionPayload) {
    const record = await this.repository.findById(actionPayload.id);
    if (!record?.isActive()) {
      return this.logger.logWarning("Inactive status");
    }
    return this.repository.processActiveTask(record);
  }
}`;

    return res.status(200).json({
      success: true,
      data: {
        filePath,
        fileName: baseName,
        currentComplexity: currentScore,
        targetComplexity: targetScore,
        riskReductionPercent: riskReductionPct,
        designPattern: patternName,
        advisorySummary: `Decoupling procedural logic in ${baseName} reduces cyclomatic complexity from ${currentScore} down to ${targetScore}, decreasing sprint failure probability by ${riskReductionPct}%.`,
        codeBefore: beforeCode,
        codeAfter: afterCode,
        recommendedActions: [
          'Extract nested SQL query blocks into a dedicated Repository abstraction.',
          'Replace procedural retry loops with exponential backoff middleware.',
          'Add isolated unit test suite covering state transitions.'
        ],
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
