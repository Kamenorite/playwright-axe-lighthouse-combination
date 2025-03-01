/**
 * Predefined device configurations
 */
const deviceConfigs = {
  desktop: {
    mobile: false,
    deviceScaleFactor: 1,
    width: 1920,
    height: 1080
  },
  mobile: {
    mobile: true,
    deviceScaleFactor: 2,
    width: 360,
    height: 640
  },
  tablet: {
    mobile: true,
    deviceScaleFactor: 2,
    width: 768,
    height: 1024
  }
};

/**
 * Default device settings for Lighthouse audits
 */
const defaultDeviceSettings = {
  ...deviceConfigs[process.env.LIGHTHOUSE_DEVICE_TYPE || 'desktop'],
  // Allow overrides from env variables
  mobile: process.env.LIGHTHOUSE_MOBILE === 'true',
  deviceScaleFactor: parseFloat(process.env.LIGHTHOUSE_DEVICE_SCALE) || deviceConfigs.desktop.deviceScaleFactor,
  width: parseInt(process.env.LIGHTHOUSE_WIDTH) || deviceConfigs.desktop.width,
  height: parseInt(process.env.LIGHTHOUSE_HEIGHT) || deviceConfigs.desktop.height
};

/**
 * Default throttling settings for Lighthouse audits
 */
const defaultThrottlingSettings = {
  throttlingMethod: process.env.LIGHTHOUSE_THROTTLING_METHOD || 'simulate',
  cpuSlowdownMultiplier: parseInt(process.env.LIGHTHOUSE_CPU_SLOWDOWN) || 2,
  downloadThroughputKbps: parseInt(process.env.LIGHTHOUSE_DOWNLOAD_SPEED) || 2048,
  uploadThroughputKbps: parseInt(process.env.LIGHTHOUSE_UPLOAD_SPEED) || 1024,
  latencyMs: parseInt(process.env.LIGHTHOUSE_LATENCY) || 50
};

/**
 * Default paths for reports
 */
const reportPaths = {
  lighthouse: 'reports/lighthouse',
  axe: 'reports/axe',
  consolidated: 'reports/consolidated'
};

/**
 * Default options for Lighthouse audit
 */
const defaultLighthouseOptions = {
  port: 9222,
  output: ['html', 'json'],
  logLevel: 'error',
  thresholds: {
    performance: 80,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
    pwa: 50
  }
};

module.exports = {
  defaultDeviceSettings,
  defaultThrottlingSettings,
  reportPaths,
  defaultLighthouseOptions
}; 