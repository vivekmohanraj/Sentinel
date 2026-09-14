import pool from '../config/db.js';

/**
 * Parse a GitHub URL into owner/repo components.
 */
const parseGitHubUrl = (input) => {
  if (!input) return null;
  const match = input.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  if (input.includes('/')) {
    const parts = input.split('/');
    return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
  }
  return null;
};

/**
 * Classify a commit as a failure/fix commit using Conventional Commit patterns.
 * Mirrors the same logic used in doraModel.js.
 */
const isFailureCommit = (message) => {
  if (!message) return false;
  const msg = message.trim();
  if (/^(fix|hotfix|revert|bugfix)\b/i.test(msg)) return true;
  if (/^fix\([^)]*\)\s*[!:]?/i.test(msg)) return true;
  if (/\bbug\s*fix\b/i.test(msg)) return true;
  if (/\bhot[\s-]?fix\b/i.test(msg)) return true;
  if (/^revert\b/i.test(msg)) return true;
  if (/\[(hotfix|bugfix|bug|revert)\]/i.test(msg)) return true;
  return false;
};

/**
 * Extract the commit type prefix from a Conventional Commit message.
 * Returns the type (feat, fix, docs, test, refactor, perf, chore, etc.) or 'other'.
 */
const extractCommitType = (message) => {
  if (!message) return 'other';
  const match = message.trim().match(/^(\w+)(?:\([^)]*\))?[!:]?\s*/);
  if (match) {
    const type = match[1].toLowerCase();
    const knownTypes = ['feat', 'fix', 'docs', 'test', 'refactor', 'perf', 'chore', 'style', 'ci', 'build', 'revert', 'hotfix', 'bugfix', 'improve'];
    if (knownTypes.includes(type)) return type;
  }
  return 'other';
};

/**
 * Compute full contributor analytics from tbl_commit_record for a given repository.
 */
export const calculateContributorAnalytics = async (repoFilter) => {
  try {
    // Resolve the repository
    let repoObj = null;
    if (repoFilter && repoFilter.trim()) {
      const trimmed = repoFilter.trim();
      const parsed = parseGitHubUrl(trimmed);
      const repoRes = await pool.query(
        `SELECT id, name, git_url FROM tbl_repository
         WHERE id::text = $1
            OR LOWER(name) = LOWER($1)
            OR LOWER(git_url) = LOWER($1)
            OR LOWER(git_url) LIKE LOWER($2)
            OR ($3::text IS NOT NULL AND (LOWER(name) = LOWER($3) OR LOWER(git_url) LIKE LOWER($4)))
         LIMIT 1`,
        [
          trimmed,
          `%${trimmed}%`,
          parsed ? `${parsed.owner}/${parsed.repo}` : null,
          parsed ? `%github.com/${parsed.owner}/${parsed.repo}%` : null
        ]
      );
      if (repoRes.rows.length > 0) {
        repoObj = repoRes.rows[0];
      }
    }

    if (!repoObj) {
      const latestRepoRes = await pool.query(
        `SELECT id, name, git_url FROM tbl_repository ORDER BY created_at DESC LIMIT 1`
      );
      if (latestRepoRes.rows.length > 0) {
        repoObj = latestRepoRes.rows[0];
      }
    }

    const repoId = repoObj?.id || null;
    const repoName = repoObj?.name || 'All Connected Repositories';

    // Fetch all commit records for this repository
    let commits = [];
    if (repoId) {
      const commitRes = await pool.query(
        `SELECT hash, author_email, message, lines_added, lines_deleted, timestamp
         FROM tbl_commit_record
         WHERE repository_id = $1
         ORDER BY timestamp ASC`,
        [repoId]
      );
      commits = commitRes.rows;
    }

    if (commits.length === 0) {
      return {
        repository: { id: repoId, name: repoName },
        totalContributors: 0,
        totalCommits: 0,
        busFactor: { score: 0, risk: 'Critical', description: 'No commit data available for analysis.' },
        contributors: [],
        commitTypeDistribution: {},
        activityTimeline: [],
        topContributorsByChurn: []
      };
    }

    // Build per-author aggregation
    const authorMap = new Map();
    const commitTypeCounts = {};
    const hourBuckets = new Array(24).fill(0);

    for (const c of commits) {
      const author = c.author_email || 'unknown';
      const added = parseInt(c.lines_added || 0, 10);
      const deleted = parseInt(c.lines_deleted || 0, 10);
      const churn = added + deleted;
      const isFix = isFailureCommit(c.message);
      const commitType = extractCommitType(c.message);
      const ts = new Date(c.timestamp);

      // Track commit hour distribution
      hourBuckets[ts.getHours()]++;

      // Track commit type distribution
      commitTypeCounts[commitType] = (commitTypeCounts[commitType] || 0) + 1;

      if (!authorMap.has(author)) {
        authorMap.set(author, {
          email: author,
          commits: 0,
          linesAdded: 0,
          linesDeleted: 0,
          totalChurn: 0,
          fixCommits: 0,
          featureCommits: 0,
          firstCommit: ts,
          lastCommit: ts,
          commitTypes: {},
          activeDays: new Set()
        });
      }

      const entry = authorMap.get(author);
      entry.commits++;
      entry.linesAdded += added;
      entry.linesDeleted += deleted;
      entry.totalChurn += churn;
      if (isFix) entry.fixCommits++;
      else entry.featureCommits++;
      if (ts < entry.firstCommit) entry.firstCommit = ts;
      if (ts > entry.lastCommit) entry.lastCommit = ts;
      entry.commitTypes[commitType] = (entry.commitTypes[commitType] || 0) + 1;
      entry.activeDays.add(ts.toISOString().split('T')[0]);
    }

    const totalCommits = commits.length;
    const totalChurn = commits.reduce((acc, c) => acc + parseInt(c.lines_added || 0, 10) + parseInt(c.lines_deleted || 0, 10), 0);

    // Build sorted contributor list
    const contributors = Array.from(authorMap.values())
      .map((a) => {
        const commitShare = parseFloat(((a.commits / totalCommits) * 100).toFixed(1));
        const churnShare = totalChurn > 0 ? parseFloat(((a.totalChurn / totalChurn) * 100).toFixed(1)) : 0;
        const fixRatio = a.commits > 0 ? parseFloat(((a.fixCommits / a.commits) * 100).toFixed(1)) : 0;
        const activeDaysCount = a.activeDays.size;

        // Derive a display name from the email
        let displayName = a.email;
        if (a.email.startsWith('@')) {
          displayName = a.email.substring(1);
        } else if (a.email.includes('@')) {
          displayName = a.email.split('@')[0];
        }

        return {
          email: a.email,
          displayName,
          commits: a.commits,
          linesAdded: a.linesAdded,
          linesDeleted: a.linesDeleted,
          totalChurn: a.totalChurn,
          fixCommits: a.fixCommits,
          featureCommits: a.featureCommits,
          commitShare,
          churnShare,
          fixRatio,
          activeDays: activeDaysCount,
          firstCommit: a.firstCommit.toISOString(),
          lastCommit: a.lastCommit.toISOString(),
          topCommitType: Object.entries(a.commitTypes).sort((x, y) => y[1] - x[1])[0]?.[0] || 'other'
        };
      })
      .sort((a, b) => b.commits - a.commits);

    // Bus Factor Calculation
    // Sort contributors by churn share descending and find how many account for >= 50% of total churn
    const sortedByChurn = [...contributors].sort((a, b) => b.churnShare - a.churnShare);
    let cumulativeChurn = 0;
    let busFactorCount = 0;
    for (const c of sortedByChurn) {
      cumulativeChurn += c.churnShare;
      busFactorCount++;
      if (cumulativeChurn >= 50) break;
    }

    const totalContributors = contributors.length;
    let busFactorRisk = 'Low';
    let busFactorDescription = '';
    if (busFactorCount <= 1) {
      busFactorRisk = 'Critical';
      busFactorDescription = `A single contributor owns >50% of all code churn. Severe knowledge concentration risk — immediate cross-training recommended.`;
    } else if (busFactorCount <= 2) {
      busFactorRisk = 'High';
      busFactorDescription = `Only ${busFactorCount} contributors cover >50% of churn. High risk of knowledge loss if either becomes unavailable.`;
    } else if (busFactorCount <= Math.ceil(totalContributors * 0.3)) {
      busFactorRisk = 'Medium';
      busFactorDescription = `${busFactorCount} contributors cover >50% of churn. Moderate concentration — consider distributing ownership of high-churn modules.`;
    } else {
      busFactorRisk = 'Low';
      busFactorDescription = `Churn is well-distributed across ${busFactorCount} contributors. Healthy knowledge distribution.`;
    }

    // Activity Timeline: bucket commits into time periods
    const firstTs = new Date(commits[0].timestamp).getTime();
    const lastTs = new Date(commits[commits.length - 1].timestamp).getTime();
    const timeSpanMs = Math.max(lastTs - firstTs, 86400000);
    const bucketCount = Math.min(12, Math.max(4, Math.ceil(timeSpanMs / (7 * 86400000))));
    const bucketSizeMs = timeSpanMs / bucketCount;

    const timelineBuckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = new Date(firstTs + i * bucketSizeMs);
      timelineBuckets.push({
        label: bucketStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        commits: 0,
        authors: new Set()
      });
    }

    for (const c of commits) {
      const ts = new Date(c.timestamp).getTime();
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((ts - firstTs) / bucketSizeMs)));
      timelineBuckets[idx].commits++;
      timelineBuckets[idx].authors.add(c.author_email);
    }

    const activityTimeline = timelineBuckets.map((b) => ({
      label: b.label,
      commits: b.commits,
      activeAuthors: b.authors.size
    }));

    // Peak activity hours
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakHourLabel = `${peakHour.toString().padStart(2, '0')}:00–${((peakHour + 1) % 24).toString().padStart(2, '0')}:00`;

    return {
      repository: { id: repoId, name: repoName },
      totalContributors,
      totalCommits,
      totalChurn,
      peakActivityHour: peakHourLabel,
      busFactor: {
        score: busFactorCount,
        risk: busFactorRisk,
        description: busFactorDescription
      },
      commitTypeDistribution: commitTypeCounts,
      contributors: contributors.slice(0, 50), // Top 50
      topContributorsByChurn: sortedByChurn.slice(0, 10),
      activityTimeline
    };
  } catch (err) {
    console.error('[Contributor Model] Error computing contributor analytics:', err);
    throw err;
  }
};
