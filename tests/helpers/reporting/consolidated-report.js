const fs = require('fs');
const path = require('path');
const { getFormattedTimestamp, formatDisplayDate, ensureDirectoryExists } = require('../utils/file-utils');
const { reportPaths } = require('../config/audit-config');
const testState = require('../state');

// Log level constants
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info'
};

let executionTimestamp = null;

/**
 * Resets test results and cleans up old reports
 */
function resetTestResults() {
  executionTimestamp = getFormattedTimestamp();
  ensureDirectoryExists(reportPaths.consolidated);
}

/**
 * Generates a consolidated report from all test results
 * @returns {Object} Report paths
 */
function generateConsolidatedReport() {
  if (!executionTimestamp) {
    executionTimestamp = getFormattedTimestamp();
  }

  const testResults = testState.getResults();
  console.log(`Generating consolidated report with ${testResults.length} results from state`);

  // Ensure the consolidated reports directory exists
  ensureDirectoryExists(reportPaths.consolidated);

  const htmlReportPath = path.join(reportPaths.consolidated, `consolidated-${executionTimestamp}.html`);
  const jsonReportPath = path.join(reportPaths.consolidated, `consolidated-${executionTimestamp}.json`);

  // Generate and save HTML report
  const htmlReport = createConsolidatedHtmlReport(executionTimestamp, testResults);
  fs.writeFileSync(htmlReportPath, htmlReport);

  // Get thresholds from the first result
  const thresholds = testResults[0]?.lighthouseResults?.thresholds || {};

  // Generate and save JSON report
  const jsonReport = {
    timestamp: executionTimestamp,
    displayDate: formatDisplayDate(executionTimestamp),
    totalTests: testResults.length,
    thresholds,
    summary: {
      totalAccessibilityViolations: testResults.reduce((acc, r) => acc + (r.axeResults?.metrics?.total_violations || 0), 0),
      averageMetrics: Object.fromEntries(
        Object.entries(thresholds).map(([key, threshold]) => [
          key,
          {
            score: Math.round(testResults.reduce((acc, r) => acc + (r.lighthouseResults?.metrics?.[key] || 0), 0) / testResults.length),
            threshold: threshold,
            thresholdBreached: Math.round(testResults.reduce((acc, r) => acc + (r.lighthouseResults?.metrics?.[key] || 0), 0) / testResults.length) < threshold
          }
        ])
      )
    },
    // Datadog-friendly metrics
    metrics: testResults.map(result => ({
      timestamp: executionTimestamp,
      test_name: result.testName,
      url_path: new URL(result.url).pathname,
      // Performance scores and thresholds
      perf_threshold: thresholds.performance || 80,
      perf_score: result.lighthouseResults?.metrics?.performance || 0,
      a11y_threshold: thresholds.accessibility || 90,
      a11y_score: result.lighthouseResults?.metrics?.accessibility || 0,
      bp_threshold: thresholds['best-practices'] || 90,
      bp_score: result.lighthouseResults?.metrics?.['best-practices'] || 0,
      seo_threshold: thresholds.seo || 90,
      seo_score: result.lighthouseResults?.metrics?.seo || 0,
      // Core Web Vitals
      vital_lcp: result.lighthouseResults?.metrics?.['largest-contentful-paint'] || 0,
      vital_fid: result.lighthouseResults?.metrics?.['max-potential-fid'] || 0,
      vital_cls: result.lighthouseResults?.metrics?.['cumulative-layout-shift'] || 0,
      // Additional performance metrics
      metric_fcp: result.lighthouseResults?.metrics?.['first-contentful-paint'] || 0,
      metric_si: result.lighthouseResults?.metrics?.['speed-index'] || 0,
      metric_tbt: result.lighthouseResults?.metrics?.['total-blocking-time'] || 0,
      metric_tti: result.lighthouseResults?.metrics?.['interactive'] || 0,
      metric_ttfb: result.lighthouseResults?.metrics?.['server-response-time'] || 0,
      // Network metrics
      network_rtt: result.lighthouseResults?.metrics?.['network-rtt'] || 0,
      network_latency: result.lighthouseResults?.metrics?.['network-server-latency'] || 0,
      // Resource metrics
      resource_bytes: result.lighthouseResults?.metrics?.['total-byte-weight'] || 0,
      resource_dom_nodes: result.lighthouseResults?.metrics?.['dom-size'] || 0,
      // Test metadata
      device_type: result.testInfo.project?.name || 'unknown',
      viewport_width: result.lighthouseResults?.deviceSettings?.width || 0,
      viewport_height: result.lighthouseResults?.deviceSettings?.height || 0,
      is_mobile: result.lighthouseResults?.deviceSettings?.mobile || false,
      environment: process.env.CI ? 'ci' : 'local'
    })),
    // Keep original results for backward compatibility
    results: testResults
  };
  fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));

  return {
    html: htmlReportPath,
    json: jsonReportPath
  };
}

/**
 * Creates the HTML report content
 * @param {string} timestamp - Execution timestamp
 * @param {Array} results - Test results
 * @returns {string} HTML report content
 */
function createConsolidatedHtmlReport(timestamp, results) {
  const displayDate = formatDisplayDate(timestamp);
  const styles = getReportStyles();
  const script = getReportScript();

  // Get thresholds from the first result (they should be the same for all results)
  const thresholds = results[0]?.lighthouseResults?.thresholds || {};

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Consolidated Audit Report - ${timestamp}</title>
        <style>${styles}</style>
        <script>${script}</script>
      </head>
      <body>
        <div class="container">
          <h1>Consolidated Audit Report</h1>
          <div class="test-info">
            <p><strong>Execution Date:</strong> ${displayDate} (UTC)</p>
            <p><strong>Total Tests:</strong> ${results.length}</p>
          </div>

          <div class="summary">
            <h2>Summary</h2>
            <div class="metrics">
              <div class="metric-card">
                <div class="score">${results.length}</div>
                <div>Total Tests</div>
              </div>
              <div class="metric-card">
                <div class="score">${results.reduce((acc, r) => acc + r.axeResults.metrics.total_violations, 0)}</div>
                <div>Total Accessibility Issues</div>
              </div>
              ${Object.entries(thresholds).map(([key, threshold]) => {
                const average = Math.round(results.reduce((acc, r) => acc + r.lighthouseResults.metrics[key], 0) / results.length);
                const scoreClass = getScoreClass(average, threshold);
                return `
                  <div class="metric-card">
                    <div class="score ${scoreClass}">${average}%</div>
                    <div>${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <div class="threshold">Threshold: ${threshold}%</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${results.map((result, index) => generateTestSection(result, index)).join('')}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates a test section for the report
 * @param {Object} result - Test result
 * @param {number} index - Test index
 * @returns {string} HTML content for test section
 */
function generateTestSection(result, index) {
  const hasCriticalOrSerious = result.axeResults.metrics.critical_violations > 0 || result.axeResults.metrics.serious_violations > 0;
  const hasModerateOrMinor = result.axeResults.metrics.moderate_violations > 0 || result.axeResults.metrics.minor_violations > 0;
  
  // Determine status based on log level
  let statusIcon = '✅';
  let statusClass = 'pass';
  
  if (result.logLevel === LOG_LEVELS.ERROR || hasCriticalOrSerious || result.lighthouseResults.thresholdBreachSeverity === LOG_LEVELS.ERROR) {
    statusIcon = '❌';
    statusClass = 'fail';
  } else if (result.logLevel === LOG_LEVELS.WARN || hasModerateOrMinor || result.lighthouseResults.thresholdBreachSeverity === LOG_LEVELS.WARN) {
    statusIcon = '⚠️';
    statusClass = 'warning';
  }

  // Extract just the filename from the full paths
  const lighthouseReportPath = path.relative(
    path.dirname(path.join(reportPaths.consolidated, 'dummy')),
    result.lighthouseResults.reportPaths.html
  );
  const axeReportPath = path.relative(
    path.dirname(path.join(reportPaths.consolidated, 'dummy')),
    result.axeResults.reportPaths.html
  );
  
  // Get relative path for test file
  const relativePath = path.relative(process.cwd(), result.testFile);

  // Define which metrics to show
  const metricsToShow = [
    'total_violations',
    'critical_violations',
    'serious_violations',
    'moderate_violations',
    'minor_violations',
    'passes',
    'total_tests'
  ];

  // Get thresholds from the first result (they should be the same for all results)
  const defaultThresholds = {
    performance: 80,
    accessibility: 90,
    'best-practices': 90,
    seo: 90
  };

  return `
    <div class="test-section ${statusClass}">
      <div class="test-header" onclick="toggleSection(${index})">
        <span class="caret" id="caret-${index}"></span>
        <span class="status-icon">${statusIcon}</span>
        <span class="test-title">${relativePath} - ${result.testName}</span>
      </div>
      
      <div class="test-content" id="test-content-${index}">
        <p><strong>URL:</strong> ${result.url}</p>
        
        <h3>Performance Metrics</h3>
        <div class="metrics">
          ${Object.entries(result.lighthouseResults.metrics)
            .filter(([key]) => key !== 'pwa') // Remove PWA metrics
            .map(([key, value]) => {
              const threshold = defaultThresholds[key];
              const scoreClass = getScoreClass(value, threshold);
              return `
                <div class="metric-card">
                  <div class="score ${scoreClass}">${value}%</div>
                  <div>${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  ${threshold ? `<div class="threshold">Threshold: ${threshold}%</div>` : ''}
                </div>
              `;
            }).join('')}
        </div>

        <h3>Accessibility Results</h3>
        <div class="metrics">
          ${Object.entries(result.axeResults.metrics)
            .filter(([key]) => metricsToShow.includes(key))
            .map(([key, value]) => `
              <div class="metric-card">
                <div class="score">${value}</div>
                <div>${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
              </div>
            `).join('')}
        </div>

        <div class="report-links">
          <a href="${lighthouseReportPath}" class="report-link" target="_blank">View Lighthouse Report</a>
          <a href="${axeReportPath}" class="report-link" target="_blank">View Accessibility Report</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Gets the CSS class for a score
 * @param {number} score - Performance score
 * @param {number} threshold - Score threshold
 * @returns {string} CSS class name
 */
function getScoreClass(score, threshold) {
  if (score >= threshold) return 'good';
  if (score >= threshold * 0.95) return 'average';
  return 'poor';
}

/**
 * Gets the CSS styles for the report
 * @returns {string} CSS styles
 */
function getReportStyles() {
  return `
    body { 
      font-family: Arial, sans-serif; 
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section {
      margin-bottom: 2em;
      padding: 1em;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1em;
      margin: 1em 0;
    }
    .metric-card {
      padding: 1em;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f8f9fa;
    }
    .score {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    .good { color: #0cce6b; }
    .average { color: #ffa400; }
    .poor { color: #ff4e42; }
    .test-section {
      margin-bottom: 2em;
      padding: 1em;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .test-section.fail { border-left: 5px solid #ff4e42; }
    .test-section.warning { border-left: 5px solid #ffa400; }
    .test-section.pass { border-left: 5px solid #0cce6b; }
    .test-header {
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .test-header:hover {
      background: #f8f9fa;
    }
    .status-icon {
      font-size: 1.2em;
      min-width: 1.5em;
    }
    .caret {
      display: inline-block;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid #666;
      transition: transform 0.2s;
    }
    .caret.expanded {
      transform: rotate(90deg);
    }
    .test-content {
      display: none;
      margin-top: 1em;
    }
    .test-content.expanded {
      display: block;
    }
    .test-title {
      flex-grow: 1;
    }
    .report-links {
      margin-top: 1em;
      text-align: right;
    }
    .report-link {
      display: inline-block;
      padding: 0.5em 1em;
      background: #f0f0f0;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9em;
      margin-left: 1em;
    }
    .report-link:hover {
      background: #e0e0e0;
    }
    .threshold {
      font-size: 0.8em;
      color: #666;
      margin-top: 0.5em;
    }
  `;
}

/**
 * Gets the JavaScript for the report
 * @returns {string} JavaScript code
 */
function getReportScript() {
  return `
    function toggleSection(index) {
      const content = document.getElementById('test-content-' + index);
      const caret = document.getElementById('caret-' + index);
      content.classList.toggle('expanded');
      caret.classList.toggle('expanded');
    }
  `;
}

module.exports = {
  resetTestResults,
  generateConsolidatedReport
}; 