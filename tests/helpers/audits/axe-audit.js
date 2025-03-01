const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');
const path = require('path');
const { getFormattedTimestamp, ensureDirectoryExists } = require('../utils/file-utils');
const { reportPaths } = require('../config/audit-config');

/**
 * Runs an accessibility audit using Axe
 * @param {import('playwright').Page} page - Playwright page object
 * @param {Object} options - Audit options
 * @returns {Promise<Object>} Audit results
 */
async function runAccessibilityAudit(page, options = {}) {
  const timestamp = getFormattedTimestamp();
  
  // Ensure reports directory exists
  ensureDirectoryExists(reportPaths.axe);

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait for page content to be visible - using a more generic approach
  // instead of waiting for a specific selector like '.todoapp'
  await page.waitForSelector('body', { state: 'visible' });

  // Configure Axe builder with more comprehensive options
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .options({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      },
      rules: {
        'color-contrast': { enabled: true },
        'document-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'label': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true }
      }
    });

  // Run the audit
  const results = await builder.analyze();

  // Generate report paths
  const jsonReportPath = path.join(reportPaths.axe, `axe-${timestamp}.json`);
  const htmlReportPath = path.join(reportPaths.axe, `axe-${timestamp}.html`);

  // Save JSON report
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));

  // Calculate metrics
  const metrics = {
    total_violations: results.violations.length,
    critical_violations: results.violations.filter(v => v.impact === 'critical').length,
    serious_violations: results.violations.filter(v => v.impact === 'serious').length,
    moderate_violations: results.violations.filter(v => v.impact === 'moderate').length,
    minor_violations: results.violations.filter(v => v.impact === 'minor').length,
    passes: results.passes.length,
    total_tests: results.passes.length + results.violations.length,
    has_critical_or_serious: results.violations.some(v => ['critical', 'serious'].includes(v.impact)),
    has_moderate_or_minor: results.violations.some(v => ['moderate', 'minor'].includes(v.impact))
  };

  // Generate HTML report
  const htmlReport = generateAxeHtmlReport(results, metrics);
  fs.writeFileSync(htmlReportPath, htmlReport);

  return {
    metrics,
    violations: results.violations,
    reportPaths: {
      html: htmlReportPath,
      json: jsonReportPath
    }
  };
}

/**
 * Generates an HTML report from Axe results
 * @param {Object} results - Axe audit results
 * @param {Object} metrics - Calculated metrics
 * @returns {string} HTML report content
 */
function generateAxeHtmlReport(results, metrics) {
  const getStatusIcon = () => {
    if (metrics.has_critical_or_serious) {
      return '❌'; // Red cross for critical/serious violations
    } else if (metrics.has_moderate_or_minor) {
      return '⚠️'; // Orange warning for moderate/minor violations
    }
    return '✅'; // Green check for no violations
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Accessibility Audit Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .violation { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
          .critical { border-left: 5px solid #ff0000; }
          .serious { border-left: 5px solid #ff9900; }
          .moderate { border-left: 5px solid #ffcc00; }
          .minor { border-left: 5px solid #ffff00; }
          .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .metric-card { padding: 20px; background: #f5f5f5; border-radius: 5px; }
          .status-icon { font-size: 2em; margin-bottom: 10px; }
          .violation-header { display: flex; align-items: center; gap: 10px; }
          .violation-icon { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <h1>Accessibility Audit Report</h1>
        
        <div class="metrics">
          <div class="metric-card">
            <div class="status-icon">${getStatusIcon()}</div>
            <h3>Total Violations: ${metrics.total_violations}</h3>
            <p>Critical: ${metrics.critical_violations}</p>
            <p>Serious: ${metrics.serious_violations}</p>
            <p>Moderate: ${metrics.moderate_violations}</p>
            <p>Minor: ${metrics.minor_violations}</p>
          </div>
          <div class="metric-card">
            <h3>Tests Passed: ${metrics.passes}</h3>
            <p>Total Tests: ${metrics.total_tests}</p>
          </div>
        </div>

        <h2>Violations</h2>
        ${results.violations.map(violation => `
          <div class="violation ${violation.impact}">
            <div class="violation-header">
              <span class="violation-icon">${violation.impact === 'critical' || violation.impact === 'serious' ? '❌' : '⚠️'}</span>
              <h3>${violation.help} (${violation.impact})</h3>
            </div>
            <p>${violation.description}</p>
            <p><strong>Impact:</strong> ${violation.impact}</p>
            <p><strong>Tags:</strong> ${violation.tags.join(', ')}</p>
            <details>
              <summary>Affected Elements (${violation.nodes.length})</summary>
              <ul>
                ${violation.nodes.map(node => `
                  <li>
                    <code>${node.html}</code>
                    <p>${node.failureSummary}</p>
                  </li>
                `).join('')}
              </ul>
            </details>
          </div>
        `).join('')}
      </body>
    </html>
  `;
}

module.exports = {
  runAccessibilityAudit
}; 