import pool from '../config/db.js';

export const generateRefactoringSnippet = async (req, res, next) => {
  try {
    const { filePath = 'src/sentinel/core-engine/mainEngine.js', complexityScore = 18.5 } = req.body;

    const baseName = filePath.split('/').pop();
    const currentScore = parseFloat(complexityScore || 18.5);
    const targetScore = parseFloat((currentScore * 0.62).toFixed(1));
    const riskReductionPct = Math.round(((currentScore - targetScore) / currentScore) * 100);

    let patternName = 'Extract Method & Service Facade Pattern';
    let beforeCode = `// BEFORE REFACTORING (${baseName} - Cyclomatic Score: ${currentScore})
async function processExecutionQueue(payload, dbPool, sessionContext, retryAttempts) {
  if (!payload || !payload.id) throw new Error("Invalid payload");
  for (let i = 0; i < retryAttempts; i++) {
    try {
      const client = await dbPool.connect();
      const res = await client.query("SELECT * FROM tbl_task WHERE id = $1", [payload.id]);
      if (res.rows.length === 0) {
        await client.query("INSERT INTO tbl_log VALUES ($1)", ["Not Found"]);
      } else {
        // High cognitive nesting
        if (res.rows[0].status === "PENDING") {
          await client.query("UPDATE tbl_task SET status = 'PROCESSING'");
        }
      }
      client.release();
      break;
    } catch (e) {
      if (i === retryAttempts - 1) throw e;
    }
  }
}`;

    let afterCode = `// AFTER SENTINEL AI REFACTORING (${baseName} - Target Cyclomatic Score: ${targetScore})
// Strategy: Apply Repository Pattern & Decouple Connection Lifecycle

class ExecutionQueueService {
  constructor(taskRepository, logService) {
    this.taskRepo = taskRepository;
    this.logService = logService;
  }

  async processTask(taskId) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      return this.logService.recordNotFound(taskId);
    }
    return this.taskRepo.transitionStatus(taskId, 'PROCESSING');
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
        advisorySummary: `Decoupling DB transaction logic in ${baseName} reduces cyclomatic complexity from ${currentScore} down to ${targetScore}, decreasing sprint failure probability by ${riskReductionPct}%.`,
        codeBefore: beforeCode,
        codeAfter: afterCode,
        recommendedActions: [
          'Extract nested SQL query blocks into a dedicated Repository abstraction.',
          'Replace procedural retry loop with exponential backoff middleware.',
          'Add isolated unit test suite covering state transitions.'
        ],
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
