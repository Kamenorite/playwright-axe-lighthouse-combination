const { playAudit } = require('playwright-lighthouse');
const path = require('path');
const fs = require('fs');
const { getFormattedTimestamp, ensureDirectoryExists } = require('../utils/file-utils');
const { defaultDeviceSettings, defaultThrottlingSettings, reportPaths, defaultLighthouseOptions } = require('../config/audit-config');

/**
 * Runs a Lighthouse audit on the given page
 * @param {import('playwright').Page} page - Playwright page object
 * @param {Object} options - Audit options
 * @returns {Promise<Object>} Audit results
 */
async function runLighthouseAudit(page, options = {}) {
  const timestamp = getFormattedTimestamp();
  const runIndex = options.runIndex || 0;
  const runSuffix = runIndex > 0 ? `-${runIndex}` : '';
  
  // Ensure reports directory exists
  ensureDirectoryExists(reportPaths.lighthouse);

  // Setup device and throttling settings
  const deviceSettings = {
    ...defaultDeviceSettings,
    ...options.deviceSettings
  };

  const throttlingSettings = {
    ...defaultThrottlingSettings,
    ...options.throttlingSettings
  };

  // Configure audit options
  const auditConfig = {
    ...defaultLighthouseOptions,
    ...options,
    port: options.port || defaultLighthouseOptions.port,
    url: page.url(),
    formFactor: deviceSettings.mobile ? 'mobile' : 'desktop',
    screenEmulation: {
      mobile: deviceSettings.mobile,
      deviceScaleFactor: deviceSettings.deviceScaleFactor,
      width: deviceSettings.width,
      height: deviceSettings.height,
    },
    throttling: {
      method: throttlingSettings.throttlingMethod,
      cpuSlowdownMultiplier: throttlingSettings.cpuSlowdownMultiplier,
      downloadThroughputKbps: throttlingSettings.downloadThroughputKbps,
      uploadThroughputKbps: throttlingSettings.uploadThroughputKbps,
      latencyMs: throttlingSettings.latencyMs,
    }
  };

  // Run the audit
  const results = await playAudit({
    page,
    port: auditConfig.port,
    thresholds: auditConfig.thresholds,
    config: {
      extends: 'lighthouse:default',
      settings: {
        formFactor: auditConfig.formFactor,
        screenEmulation: auditConfig.screenEmulation,
        throttling: auditConfig.throttling,
        output: ['html', 'json'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    }
  });

  // Extract metrics from the results
  const metrics = {
    performance: Math.round(results.lhr.categories.performance.score * 100),
    accessibility: Math.round(results.lhr.categories.accessibility.score * 100),
    'best-practices': Math.round(results.lhr.categories['best-practices'].score * 100),
    seo: Math.round(results.lhr.categories.seo.score * 100)
  };

  // Check if any metrics are below thresholds
  const thresholdBreached = Object.entries(auditConfig.thresholds || {}).some(([key, threshold]) => {
    return metrics[key] < threshold;
  });

  // Save reports
  const htmlReportPath = path.join(reportPaths.lighthouse, `lighthouse-${timestamp}${runSuffix}.html`);
  const jsonReportPath = path.join(reportPaths.lighthouse, `lighthouse-${timestamp}${runSuffix}.json`);

  fs.writeFileSync(htmlReportPath, results.report[0]);
  fs.writeFileSync(jsonReportPath, results.report[1]);

  return {
    metrics,
    thresholdBreached,
    reportPaths: {
      html: htmlReportPath,
      json: jsonReportPath
    }
  };
}

module.exports = {
  runLighthouseAudit
}; 