const { runLighthouseAudit } = require("./audits/lighthouse-audit");
const { runAccessibilityAudit } = require("./audits/axe-audit");
const {
  generateConsolidatedReport,
} = require("./reporting/consolidated-report");
const auditCache = require("./audits/audit-cache");
const {
  defaultDeviceSettings,
  defaultThrottlingSettings,
  reportPaths,
} = require("./config/audit-config");
const testState = require("./state");
const { ensureDirectoryExists } = require("./utils/file-utils");

const testResults = [];

/**
 * Reset test results array
 */
function resetTestResults() {
  testState.reset();
  auditCache.clear();

  // Ensure report directories exist
  ensureDirectoryExists(reportPaths.consolidated);
  ensureDirectoryExists(reportPaths.lighthouse);
  ensureDirectoryExists(reportPaths.axe);
}

/**
 * Add a test result to the collection
 * @param {Object} result - Test result to add
 */
function addTestResult(result) {
  testResults.push(result);
}

/**
 * Calculate average Lighthouse scores from multiple runs
 * @param {Array} runs - Array of Lighthouse results
 * @returns {Object} Averaged results
 */
function calculateAverageLighthouseScores(runs) {
  if (!runs || runs.length === 0) return null;

  const metrics = [
    "performance",
    "accessibility",
    "bestPractices",
    "seo",
    "pwa",
  ];
  const totals = {};

  // Initialize totals
  metrics.forEach((metric) => (totals[metric] = 0));

  // Sum up all scores
  runs.forEach((run) => {
    if (run && run.scores) {
      metrics.forEach((metric) => {
        if (typeof run.scores[metric] === "number") {
          totals[metric] += run.scores[metric];
        }
      });
    }
  });

  // Calculate averages
  const averages = {};
  metrics.forEach((metric) => {
    averages[metric] = Math.round((totals[metric] / runs.length) * 100) / 100;
  });

  // Return averaged result with all the other properties from the last run
  return {
    ...runs[runs.length - 1],
    scores: averages,
    runs: runs.length,
  };
}

/**
 * Run combined accessibility and performance audit
 * @param {import('playwright').Page} page - Playwright page object
 * @param {import('@playwright/test').TestInfo} testInfo - Test info object
 * @param {Object} config - Audit configuration
 */
async function runCombinedAudit(page, testInfo, config = {}) {
  const url = page.url();
  const state = await getPageState(page);
  const REQUIRED_LIGHTHOUSE_RUNS = 3;

  let axeResults = null;
  let lighthouseResults = null;

  // Handle Axe audit (can be cached as it's deterministic)
  if (process.env.ENABLE_AXE === "true") {
    if (auditCache.has(url, state)) {
      const cachedResults = auditCache.get(url, state);
      axeResults = cachedResults.axeResults;
    } else {
      axeResults = await runAccessibilityAudit(page, config);
      auditCache.set(url, { axeResults }, state);
    }
  }

  // Handle Lighthouse audit (multiple runs)
  if (process.env.ENABLE_LIGHTHOUSE === "true") {
    if (
      !auditCache.hasEnoughLighthouseRuns(url, state, REQUIRED_LIGHTHOUSE_RUNS)
    ) {
      // Run Lighthouse multiple times if we don't have enough runs
      const remainingRuns =
        REQUIRED_LIGHTHOUSE_RUNS -
        auditCache.getLighthouseRuns(url, state).length;
      for (let i = 0; i < remainingRuns; i++) {
        const result = await runLighthouseAudit(page, config);
        auditCache.addLighthouseRun(url, result, state);
      }
    }

    // Calculate average scores from all runs
    const allRuns = auditCache.getLighthouseRuns(url, state);
    lighthouseResults = calculateAverageLighthouseScores(allRuns);
  }

  // Create the result object
  const result = {
    testFile: testInfo.file,
    testName: testInfo.title || `Test for ${url}`,
    url,
    lighthouseResults,
    axeResults,
    testInfo: {
      title: testInfo.title || `Test for ${url}`,
      url,
      project: testInfo.project,
    },
  };

  // Add to test results
  testState.addResult(result);

  return result;
}

/**
 * Determine the current state of the page
 * @param {import('playwright').Page} page - Playwright page object
 * @returns {Promise<string>} State identifier
 */
async function getPageState(page) {
  const states = {
    empty: async () => {
      const items = await page.$$(".todo-list li");
      return items.length === 0;
    },
    completed: async () => {
      const completedItems = await page.$$(".todo-list li.completed");
      const totalItems = await page.$$(".todo-list li");
      return (
        completedItems.length > 0 && completedItems.length === totalItems.length
      );
    },
    mixed: async () => {
      const completedItems = await page.$$(".todo-list li.completed");
      const totalItems = await page.$$(".todo-list li");
      return (
        completedItems.length > 0 && completedItems.length < totalItems.length
      );
    },
  };

  // Check each state in order
  if (await states.empty()) return "empty";
  if (await states.completed()) return "completed";
  if (await states.mixed()) return "mixed";
  return "with-items"; // Default state when there are only active items
}

module.exports = {
  runCombinedAudit,
  runLighthouseAudit,
  runAccessibilityAudit,
  resetTestResults,
  addTestResult,
  testResults,
  defaultDeviceSettings,
  defaultThrottlingSettings,
  reportPaths,
  generateConsolidatedReport,
  testState,
};
