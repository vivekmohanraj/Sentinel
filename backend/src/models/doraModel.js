import pool from '../config/db.js';
import { parseGitHubUrl } from './dashboardModel.js';

/**
 * Classify metric values into standard DORA tiers:
 * - Elite, High, Medium, Low
 */
const getDoraTier = (metricKey, val) => {
  switch (metricKey) {
    case 'deploymentFrequency': {
      // val is deployments per week
      if (val >= 7) return { tier: 'Elite', label: 'Multiple deploys/day', score: 4 };
      if (val >= 1) return { tier: 'High', label: '1/day to 1/week', score: 3 };
      if (val >= 0.25) return { tier: 'Medium', label: '1/week to 1/month', score: 2 };
      return { tier: 'Low', label: '< 1/month', score: 1 };
    }
    case 'leadTimeForChanges': {
      // val is average turnaround in hours
      if (val <= 24) return { tier: 'Elite', label: '< 1 day', score: 4 };
      if (val <= 168) return { tier: 'High', label: '1 day to 1 week', score: 3 };
      if (val <= 720) return { tier: 'Medium', label: '1 week to 1 month', score: 2 };
      return { tier: 'Low', label: '> 1 month', score: 1 };
    }
    case 'changeFailureRate': {
      // val is failure rate percentage (0 - 100)
      if (val <= 5) return { tier: 'Elite', label: '0% – 5%', score: 4 };
      if (val <= 15) return { tier: 'High', label: '5% – 15%', score: 3 };
      if (val <= 30) return { tier: 'Medium', label: '16% – 30%', score: 2 };
      return { tier: 'Low', label: '> 30%', score: 1 };
    }
    case 'meanTimeToRecovery': {
      // val is recovery time in hours
      if (val <= 1) return { tier: 'Elite', label: '< 1 hour', score: 4 };
      if (val <= 24) return { tier: 'High', label: '< 1 day', score: 3 };
      if (val <= 168) return { tier: 'Medium', label: '1 day to 1 week', score: 2 };
      return { tier: 'Low', label: '> 1 week', score: 1 };
    }
    default:
      return { tier: 'Medium', label: 'Standard', score: 2 };
  }
};

/**
 * Format durations nicely into hours, days, or minutes
 */
const formatDuration = (hours) => {
  if (hours < 1) {
    const mins = Math.max(5, Math.round(hours * 60));
    return `${mins} mins`;
  }
  if (hours < 48) {
    return `${hours.toFixed(1)} hrs`;
  }
  const days = (hours / 24).toFixed(1);
  return `${days} days`;
};

/**
 * Compute DORA and Delivery Velocity Metrics from PostgreSQL
 */
export const calculateDoraMetrics = async (repoFilter = null) => {
  try {
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

    // 1. Fetch Commit Records
    let commitsQuery = `
      SELECT hash, author_email, message, lines_added, lines_deleted, timestamp
      FROM tbl_commit_record
    `;
    const params = [];
    if (repoId) {
      commitsQuery += ` WHERE repository_id = $1`;
      params.push(repoId);
    }
    commitsQuery += ` ORDER BY timestamp ASC`;

    const commitsRes = await pool.query(commitsQuery, params);
    const commits = commitsRes.rows || [];

    // Fallback if no commits exist yet
    if (commits.length === 0) {
      return {
        repository: { id: repoId, name: repoName },
        overallTier: 'Medium',
        overallScore: 65,
        summaryHeadline: 'Awaiting Initial Commit Stream',
        metrics: {
          deploymentFrequency: {
            tier: 'Medium',
            valueText: '0 deploys / wk',
            deploymentsPerWeek: 0,
            benchmark: '1/week to 1/month',
            description: 'Rate of code merged and deployed to production environment.'
          },
          leadTimeForChanges: {
            tier: 'High',
            valueText: '24.0 hrs',
            avgHours: 24,
            benchmark: '1 day to 1 week',
            description: 'Time elapsed between code authorship and production release.'
          },
          changeFailureRate: {
            tier: 'Elite',
            valueText: '0.0%',
            failureRatePct: 0,
            benchmark: '0% – 5%',
            description: 'Percentage of releases triggering hotfix remediation.'
          },
          meanTimeToRecovery: {
            tier: 'High',
            valueText: '2.0 hrs',
            avgHours: 2,
            benchmark: '< 1 day',
            description: 'Duration required to restore stability after a deployment failure.'
          }
        },
        velocity: {
          totalCommits: 0,
          totalLinesAdded: 0,
          totalLinesDeleted: 0,
          featureRatio: 85,
          hotfixRatio: 15,
          activeContributors: 0,
          weeklyThroughput: []
        },
        recommendations: [
          'Connect an active GitHub repository or trigger mining to evaluate real commit cadence.',
          'Adopt small, frequent commits to build high deployment frequency and short lead times.'
        ]
      };
    }

    // 2. Identify Hotfix / Bug-fix vs Feature Commits
    // Uses Conventional Commit prefix matching (fix:, fix(scope):, hotfix:) and
    // word-boundary matching to avoid false positives from words like "fixtures",
    // "failure" in test descriptions, or "resolve" in refactoring contexts.
    const isFailureCommit = (message) => {
      if (!message) return false;
      const msg = message.trim();
      // Match conventional commit prefixes: fix:, fix(scope):, hotfix:, revert:
      if (/^(fix|hotfix|revert|bugfix)\b/i.test(msg)) return true;
      // Match "fix(something):" pattern
      if (/^fix\([^)]*\)\s*[!:]?/i.test(msg)) return true;
      // Match word-boundary "bug fix", "hot-fix", "patch fix" in message body
      if (/\bbug\s*fix\b/i.test(msg)) return true;
      if (/\bhot[\s-]?fix\b/i.test(msg)) return true;
      // Match explicit revert commits
      if (/^revert\b/i.test(msg)) return true;
      // Match "[HOTFIX]" or "[BUG]" bracket tags
      if (/\[(hotfix|bugfix|bug|revert)\]/i.test(msg)) return true;
      return false;
    };

    let bugCommitsCount = 0;
    let featureCommitsCount = 0;
    let featureChurn = 0;
    let hotfixChurn = 0;

    const commitTimestamps = [];
    const bugCommitTimestamps = [];
    const authorSet = new Set();

    for (const c of commits) {
      const ts = new Date(c.timestamp).getTime();
      commitTimestamps.push(ts);
      if (c.author_email) authorSet.add(c.author_email);

      const added = parseInt(c.lines_added || 0, 10);
      const deleted = parseInt(c.lines_deleted || 0, 10);
      const churn = added + deleted;

      if (isFailureCommit(c.message)) {
        bugCommitsCount++;
        hotfixChurn += churn;
        bugCommitTimestamps.push(ts);
      } else {
        featureCommitsCount++;
        featureChurn += churn;
      }
    }

    const totalCommitsCount = commits.length;
    const firstTimestamp = commitTimestamps[0];
    const lastTimestamp = commitTimestamps[commitTimestamps.length - 1];
    const nowMs = Date.now();
    const commitSpanMs = Math.max(1, lastTimestamp - firstTimestamp);

    // Check repository activity recency (dormancy)
    const dormancyDays = Math.max(0, (nowMs - lastTimestamp) / 86400000);

    // 3. Compute DORA Pillar 1: Deployment Frequency (DF)
    // Identify explicit release/deploy tags or version-bump commits
    const releaseRegex = /(release|deploy|bump|v[0-9]+\.[0-9]+|publish|ship)/i;
    const explicitReleaseCount = commits.filter((c) => releaseRegex.test(c.message || '')).length;
    const activeDaysSet = new Set(commits.map((c) => new Date(c.timestamp).toISOString().split('T')[0]));
    
    let deploymentsPerWeek = 0;
    if (dormancyDays > 21) {
      // Inactive repository: last commit was over 3 weeks ago
      deploymentsPerWeek = 0.1;
    } else {
      // Active repository: calculate deployment cadence from commits and active days
      const activeSpanDays = Math.max(1, commitSpanMs / 86400000);
      const spanWeeks = Math.max(0.14, activeSpanDays / 7);
      
      let estimatedDeploys = explicitReleaseCount;
      if (estimatedDeploys === 0) {
        // Continuous deployment estimation: multiple batches per active day if high commit velocity
        const deploysPerActiveDay = Math.max(1, Math.min(6, Math.round(commits.length / (activeDaysSet.size * 10))));
        estimatedDeploys = activeDaysSet.size * deploysPerActiveDay;
      }
      deploymentsPerWeek = parseFloat((estimatedDeploys / spanWeeks).toFixed(2));
    }

    const dfTier = getDoraTier('deploymentFrequency', deploymentsPerWeek);

    let dfValueText = `${deploymentsPerWeek} / wk`;
    if (deploymentsPerWeek >= 7) {
      dfValueText = `${(deploymentsPerWeek / 7).toFixed(1)} / day`;
    } else if (deploymentsPerWeek < 0.25) {
      dfValueText = '< 1 / mo';
    }

    // 4. Compute DORA Pillar 2: Lead Time for Changes (LTTC)
    let totalIntervalMs = 0;
    let intervalCount = 0;
    for (let i = 1; i < commitTimestamps.length; i++) {
      const diff = commitTimestamps[i] - commitTimestamps[i - 1];
      if (diff > 0 && diff < 14 * 86400000) {
        totalIntervalMs += diff;
        intervalCount++;
      }
    }
    const avgIntervalHours = intervalCount > 0
      ? (totalIntervalMs / intervalCount) / 3600000
      : 8.0;

    const leadTimeHours = parseFloat((avgIntervalHours * 1.4).toFixed(1));
    const lttcTier = getDoraTier('leadTimeForChanges', leadTimeHours);
    const lttcValueText = formatDuration(leadTimeHours);

    // 5. Compute DORA Pillar 3: Change Failure Rate (CFR)
    const cfrPct = parseFloat(((bugCommitsCount / totalCommitsCount) * 100).toFixed(1));
    const cfrTier = getDoraTier('changeFailureRate', cfrPct);
    const cfrValueText = `${cfrPct}%`;

    // 6. Compute DORA Pillar 4: Mean Time to Recovery (MTTR)
    let recoveryIntervalsSum = 0;
    let recoveryCount = 0;
    for (let i = 0; i < bugCommitTimestamps.length; i++) {
      const bugTime = bugCommitTimestamps[i];
      const fixCandidate = commitTimestamps.find((t) => t > bugTime && t <= bugTime + 7 * 86400000);
      if (fixCandidate) {
        recoveryIntervalsSum += (fixCandidate - bugTime);
        recoveryCount++;
      }
    }

    const avgRecoveryHours = recoveryCount > 0
      ? Math.max(0.3, (recoveryIntervalsSum / recoveryCount) / 3600000)
      : (bugCommitsCount > 0 ? 2.5 : 0.8);
    const mttrHours = parseFloat(avgRecoveryHours.toFixed(1));
    const mttrTier = getDoraTier('meanTimeToRecovery', mttrHours);
    const mttrValueText = formatDuration(mttrHours);

    // 7. Overall DORA Performance Composite Score (0–100)
    const tierScores = [dfTier.score, lttcTier.score, cfrTier.score, mttrTier.score];
    const avgScore = tierScores.reduce((a, b) => a + b, 0) / 4;
    const overallScore = Math.round((avgScore / 4) * 100);

    let overallTier = 'Medium';
    if (avgScore >= 3.4) overallTier = 'Elite';
    else if (avgScore >= 2.6) overallTier = 'High';
    else if (avgScore >= 1.7) overallTier = 'Medium';
    else overallTier = 'Low';

    const headlineMap = {
      Elite: 'Elite DevOps Delivery Performance',
      High: 'High Velocity Engineering Cadence',
      Medium: 'Moderate Delivery Cadence with Growth Areas',
      Low: 'Low Deployment Cadence & High Remediation Friction'
    };

    // 8. Weekly Throughput Series for Velocity Visualization
    // Anchor 6 historical weekly buckets ending at the latest activity / now (no future dates)
    const weeklyThroughput = [];
    const bucketCount = 6;
    const anchorEnd = Math.max(lastTimestamp, nowMs);

    // Determine bucket size (default to 7-day intervals, or partition total span if over 6 weeks)
    const bucketIntervalMs = commitSpanMs > 42 * 86400000
      ? commitSpanMs / bucketCount
      : 7 * 86400000;

    for (let i = 0; i < bucketCount; i++) {
      const bStart = anchorEnd - (bucketCount - i) * bucketIntervalMs;
      const bEnd = anchorEnd - (bucketCount - 1 - i) * bucketIntervalMs;
      const labelDate = new Date(bEnd);
      const key = labelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      weeklyThroughput.push({
        week: key,
        startMs: bStart,
        endMs: bEnd,
        commits: 0,
        added: 0,
        deleted: 0,
        fixes: 0
      });
    }

    for (const c of commits) {
      const ts = new Date(c.timestamp).getTime();
      // Find matching bucket
      let targetBucket = weeklyThroughput.find(b => ts >= b.startMs && ts <= b.endMs);
      if (!targetBucket) {
        if (ts < weeklyThroughput[0].startMs) {
          targetBucket = weeklyThroughput[0];
        } else {
          targetBucket = weeklyThroughput[weeklyThroughput.length - 1];
        }
      }

      if (targetBucket) {
        targetBucket.commits++;
        targetBucket.added += parseInt(c.lines_added || 0, 10);
        targetBucket.deleted += parseInt(c.lines_deleted || 0, 10);
        if (isFailureCommit(c.message)) {
          targetBucket.fixes++;
        }
      }
    }

    // Clean up internal timestamps from response
    const sanitizedWeeklyThroughput = weeklyThroughput.map(({ week, commits: cCount, added, deleted, fixes }) => ({
      week,
      commits: cCount,
      added,
      deleted,
      fixes
    }));

    // 9. Feature vs Hotfix Churn Ratios
    const totalChurn = Math.max(1, featureChurn + hotfixChurn);
    const featureRatio = Math.round((featureChurn / totalChurn) * 100);
    const hotfixRatio = 100 - featureRatio;

    // 10. Prescriptive Recommendations based on lowest tier
    const recommendations = [];
    if (cfrTier.tier === 'Low' || cfrTier.tier === 'Medium') {
      recommendations.push(
        `Change Failure Rate is at ${cfrValueText} (${cfrTier.tier} tier). Target critical hotspot modules in the Risk Radar and mandate pre-merge branch testing before merging.`
      );
    }
    if (dfTier.tier === 'Low' || dfTier.tier === 'Medium') {
      recommendations.push(
        `Deployment Frequency is ${dfValueText}. Break sprint epics into smaller, independently deliverable atomic pull requests to accelerate release cadence.`
      );
    }
    if (lttcTier.tier === 'Low' || lttcTier.tier === 'Medium') {
      recommendations.push(
        `Lead Time for Changes is ${lttcValueText}. Reduce code review turnaround latency by utilizing Sentinel co-change advisories to focus reviewers on high-impact modules.`
      );
    }
    if (mttrTier.tier === 'Low' || mttrTier.tier === 'Medium') {
      recommendations.push(
        `Mean Time to Recovery is ${mttrValueText}. Implement automated rollback mechanisms and post-incident smoke tests to restore production health faster.`
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        'Outstanding delivery performance across all four DORA pillars. Maintain automated CI/CD safeguards and continue monitoring knowledge graph co-change trends.'
      );
    }

    return {
      repository: {
        id: repoId,
        name: repoName
      },
      overallTier,
      overallScore,
      summaryHeadline: headlineMap[overallTier],
      metrics: {
        deploymentFrequency: {
          tier: dfTier.tier,
          valueText: dfValueText,
          deploymentsPerWeek,
          benchmark: dfTier.label,
          description: 'How often code is deployed to staging or production.'
        },
        leadTimeForChanges: {
          tier: lttcTier.tier,
          valueText: lttcValueText,
          avgHours: leadTimeHours,
          benchmark: lttcTier.label,
          description: 'Time from initial commit authored to merge & deployment.'
        },
        changeFailureRate: {
          tier: cfrTier.tier,
          valueText: cfrValueText,
          failureRatePct: cfrPct,
          failureCount: bugCommitsCount,
          totalCommits: totalCommitsCount,
          benchmark: cfrTier.label,
          description: 'Percentage of deployments or commits requiring emergency hotfix remediation.'
        },
        meanTimeToRecovery: {
          tier: mttrTier.tier,
          valueText: mttrValueText,
          avgHours: mttrHours,
          benchmark: mttrTier.label,
          description: 'Average time taken to restore stability after a failure.'
        }
      },
      velocity: {
        totalCommits: totalCommitsCount,
        totalLinesAdded: commits.reduce((acc, c) => acc + parseInt(c.lines_added || 0, 10), 0),
        totalLinesDeleted: commits.reduce((acc, c) => acc + parseInt(c.lines_deleted || 0, 10), 0),
        featureRatio,
        hotfixRatio,
        activeContributors: authorSet.size,
        weeklyThroughput: sanitizedWeeklyThroughput
      },
      recommendations
    };
  } catch (err) {
    console.error('[DORA Model] Error computing DORA metrics:', err);
    throw err;
  }
};
