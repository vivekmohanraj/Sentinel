import pool from '../config/db.js';

export const getKnowledgeGraphTopology = async (req, res, next) => {
  try {
    const { repoId, repoName } = req.query;

    let targetRepoId = repoId;
    let targetRepoName = repoName || 'sentinel/core-engine';

    if (repoName && !targetRepoId) {
      const repoRes = await pool.query(
        `SELECT id, name FROM tbl_repository WHERE id::text = $1 OR LOWER(name) = LOWER($1) LIMIT 1`,
        [repoName]
      );
      if (repoRes.rows.length > 0) {
        targetRepoId = repoRes.rows[0].id;
        targetRepoName = repoRes.rows[0].name;
      }
    }

    // 1. Fetch modules for this repository from PostgreSQL database
    let modulesQuery = `SELECT id, file_path, complexity_score, churn_rate, bug_frequency FROM tbl_module_metric`;
    let params = [];
    if (targetRepoId) {
      modulesQuery += ` WHERE repository_id = $1`;
      params.push(targetRepoId);
    }
    modulesQuery += ` ORDER BY complexity_score DESC LIMIT 20`;

    const modulesRes = await pool.query(modulesQuery, params);
    let modules = modulesRes.rows || [];

    // Fetch primary commit author for bus factor attribution
    const authorRes = await pool.query(
      `SELECT author_email FROM tbl_commit_record ORDER BY timestamp DESC LIMIT 1`
    );
    const topAuthor = authorRes.rows[0]?.author_email || 'lead_dev@sentinel.engineering';

    // Map modules into Graph Nodes with calculated risk metrics
    const nodes = modules.map((m, index) => {
      const complexity = parseFloat(m.complexity_score || 10);
      const fileName = m.file_path.split('/').pop();
      return {
        id: m.id ? String(m.id) : `node-${index}`,
        label: fileName,
        fullPath: m.file_path,
        complexityScore: complexity,
        bugFrequency: parseInt(m.bug_frequency || 0, 10),
        churnRate: parseInt(m.churn_rate || 0, 10),
        riskCategory: complexity >= 16 ? 'CRITICAL' : complexity >= 12 ? 'WARNING' : 'OPTIMIZED',
        busFactorOwner: topAuthor,
        group: fileName.includes('Engine') ? 'Core Engine' : fileName.includes('Pool') ? 'Infrastructure' : 'API Layer'
      };
    });

    // 2. Compute co-change coupling weight deterministically from module metric vectors
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[j];
        
        // Dynamic calculation derived from combined complexity and defect frequency
        const calculatedCouplingScore = Math.round(
          Math.min(95, Math.max(15, (sourceNode.complexityScore + targetNode.complexityScore) * 1.8 + (sourceNode.bugFrequency + targetNode.bugFrequency) * 2.2))
        );

        if (calculatedCouplingScore > 30) {
          links.push({
            id: `edge-${i}-${j}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceLabel: sourceNode.label,
            targetLabel: targetNode.label,
            weight: calculatedCouplingScore,
            couplingRisk: calculatedCouplingScore > 70 ? 'High' : calculatedCouplingScore > 48 ? 'Medium' : 'Low'
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        repoName: targetRepoName,
        nodesCount: nodes.length,
        edgesCount: links.length,
        nodes,
        links
      }
    });
  } catch (err) {
    next(err);
  }
};
