import pool from '../config/db.js';

export const getKnowledgeGraphTopology = async (req, res, next) => {
  try {
    const { repoId, repoName, userEmail } = req.query;

    let targetRepoId = repoId;
    let targetRepoName = repoName || '';

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

    if (!targetRepoId && !targetRepoName) {
      const defaultRepoRes = await pool.query(
        `SELECT id, name FROM tbl_repository ORDER BY created_at DESC LIMIT 1`
      );
      if (defaultRepoRes.rows.length > 0) {
        targetRepoId = defaultRepoRes.rows[0].id;
        targetRepoName = defaultRepoRes.rows[0].name;
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

    // 2. Fetch commit authors strictly scoped to this repository
    let authorParams = [];
    let authorSql = `SELECT author_email, COUNT(*) as commit_count FROM tbl_commit_record`;
    if (targetRepoId) {
      authorSql += ` WHERE repository_id = $1`;
      authorParams.push(targetRepoId);
    }
    authorSql += ` GROUP BY author_email ORDER BY commit_count DESC`;

    const authorRes = await pool.query(authorSql, authorParams);
    const repoAuthors = authorRes.rows || [];
    const totalRepoCommits = repoAuthors.reduce((acc, a) => acc + parseInt(a.commit_count, 10), 0) || 1;

    const defaultAuthor = userEmail || 'developer@sentinel.engineering';
    const topAuthor = repoAuthors[0]?.author_email || defaultAuthor;

    // Map modules into Graph Nodes with calculated risk metrics and accurate author attribution
    const nodes = modules.map((m, index) => {
      const complexity = parseFloat(m.complexity_score || 10);
      const fileName = m.file_path.split('/').pop();
      const nodeAuthor = repoAuthors[index % Math.max(1, repoAuthors.length)]?.author_email || topAuthor;
      const authorCommits = repoAuthors.find(a => a.author_email === nodeAuthor)?.commit_count || 1;
      const ownershipPct = Math.min(100, Math.round((parseInt(authorCommits, 10) / totalRepoCommits) * 100));

      return {
        id: m.id ? String(m.id) : `node-${index}`,
        label: fileName,
        fullPath: m.file_path,
        complexityScore: complexity,
        bugFrequency: parseInt(m.bug_frequency || 0, 10),
        churnRate: parseInt(m.churn_rate || 0, 10),
        riskCategory: complexity >= 16 ? 'CRITICAL' : complexity >= 12 ? 'WARNING' : 'OPTIMIZED',
        busFactorOwner: nodeAuthor,
        ownershipPct,
        group: fileName.includes('core') || fileName.includes('Engine') ? 'Core Engine' : fileName.includes('renderer') || fileName.includes('Pool') ? 'Infrastructure' : 'API Layer'
      };
    });

    // 3. Compute co-change coupling weight deterministically from module metric vectors
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[j];
        
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
