import pool from '../config/db.js';

export const simulatePullRequestScan = async (req, res, next) => {
  try {
    const {
      repositoryId,
      branchName = 'feature/branch-update',
      modifiedFiles = [],
      additions = 240,
      deletions = 45,
      authorEmail = 'developer@sentinel.engineering'
    } = req.body;

    // 1. Fetch Repository Details
    let repoName = 'sentinel/core-engine';
    if (repositoryId) {
      const repoRes = await pool.query(`SELECT id, name FROM tbl_repository WHERE id::text = $1 OR LOWER(name) = LOWER($1) LIMIT 1`, [repositoryId]);
      if (repoRes.rows.length > 0) {
        repoName = repoRes.rows[0].name;
      }
    }

    // Default target files if none supplied
    const targetFiles = modifiedFiles.length > 0 ? modifiedFiles : [
      'src/sentinel/core-engine/mainEngine.js',
      'src/sentinel/core-engine/apiRouter.js'
    ];

    // 2. Query module metrics from PostgreSQL for modified files
    const metricsRes = await pool.query(
      `SELECT file_path, complexity_score, churn_rate, bug_frequency 
       FROM tbl_module_metric 
       WHERE file_path = ANY($1)`,
      [targetFiles]
    );

    const foundMetrics = metricsRes.rows || [];
    let avgComplexity = 12.0;
    let maxComplexity = 12.0;
    if (foundMetrics.length > 0) {
      const scores = foundMetrics.map(m => parseFloat(m.complexity_score || 0));
      avgComplexity = scores.reduce((a, b) => a + b, 0) / scores.length;
      maxComplexity = Math.max(...scores);
    }

    // 3. Compute Risk Score & Category
    const churnImpact = Math.min(30, (additions + deletions) / 25);
    const complexityImpact = Math.min(45, maxComplexity * 2.2);
    const fileCountImpact = Math.min(25, targetFiles.length * 5);

    const rawRiskScore = Math.round(complexityImpact + churnImpact + fileCountImpact);
    const riskScore = Math.min(98, Math.max(18, rawRiskScore));

    let riskLevel = 'LOW';
    let mergeStatus = 'APPROVED';
    let advisoryMessage = 'PR passes automated risk threshold. Safe for pre-merge integration.';

    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
      mergeStatus = 'BLOCKED';
      advisoryMessage = 'CRITICAL RISK: PR modifies high-complexity core modules with high churn. Senior Tech Lead review & refactoring required before merge.';
    } else if (riskScore >= 60) {
      riskLevel = 'HIGH';
      mergeStatus = 'NEEDS_APPROVAL';
      advisoryMessage = 'HIGH RISK: Co-change coupling and complexity delta detected. Secondary co-reviewer required.';
    } else if (riskScore >= 40) {
      riskLevel = 'ELEVATED';
      mergeStatus = 'APPROVED_WITH_WARNINGS';
      advisoryMessage = 'ELEVATED RISK: Minor complexity increase. Ensure unit test coverage before deployment.';
    }

    // 4. Compute Factor Contribution Breakdown
    const factorBreakdown = [
      { feature: 'Module Cyclomatic Complexity', impact: `+${Math.round(complexityImpact)}%`, weight: parseFloat((complexityImpact / riskScore).toFixed(2)) },
      { feature: 'Line Churn & Delta Volume', impact: `+${Math.round(churnImpact)}%`, weight: parseFloat((churnImpact / riskScore).toFixed(2)) },
      { feature: 'Co-Change Temporal Coupling', impact: `+${Math.round(fileCountImpact)}%`, weight: parseFloat((fileCountImpact / riskScore).toFixed(2)) }
    ];

    // 5. Build File Level Risk Breakdown
    const fileAnalysis = targetFiles.map(file => {
      const metric = foundMetrics.find(m => m.file_path === file);
      const score = metric ? parseFloat(metric.complexity_score) : 10.5;
      return {
        filePath: file,
        complexityScore: score,
        churnRate: metric ? parseInt(metric.churn_rate, 10) : 45,
        risk: score > 16 ? 'High' : score > 12 ? 'Medium' : 'Low'
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        branchName,
        repoName,
        authorEmail,
        additions,
        deletions,
        netChurn: additions - deletions,
        riskScore,
        riskLevel,
        mergeStatus,
        advisoryMessage,
        shapBreakdown: factorBreakdown,
        factorBreakdown,
        fileAnalysis,
        scannedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
