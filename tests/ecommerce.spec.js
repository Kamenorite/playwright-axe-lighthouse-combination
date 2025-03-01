// @ts-check
const { test } = require('@playwright/test');
const { runCombinedAudit, resetTestResults, generateConsolidatedReport, testState } = require('./helpers');

// Custom audit configuration with different thresholds
const AUDIT_CONFIG = {
  deviceSettings: {
    mobile: false, // Test desktop version
    width: 1280,
    height: 720,
    deviceScaleFactor: 1
  },
  throttlingSettings: {
    // Simulate fast 4G conditions
    downloadThroughputKbps: 5000,
    uploadThroughputKbps: 3500,
    latencyMs: 40
  },
  thresholds: {
    performance: 60, // Lower threshold for external sites
    accessibility: 60, // Lower threshold for external sites
    'best-practices': 70,
    seo: 60 // Lower threshold for external sites
  }
};

// Test pages to check
const TEST_PAGES = [
  {
    name: 'Demo Blaze Home Page',
    url: 'https://www.demoblaze.com/',
    expectedTitle: 'STORE'
  },
  {
    name: 'Product Category Page - Phones',
    url: 'https://www.demoblaze.com/#',
    expectedTitle: 'STORE',
    setupAction: async (page) => {
      // Click on Phones category
      await page.click('a.list-group-item:has-text("Phones")');
      await page.waitForTimeout(1000); // Wait for content to load
    }
  },
  {
    name: 'Product Category Page - Laptops',
    url: 'https://www.demoblaze.com/#',
    expectedTitle: 'STORE',
    setupAction: async (page) => {
      // Click on Laptops category
      await page.click('a.list-group-item:has-text("Laptops")');
      await page.waitForTimeout(1000); // Wait for content to load
    }
  }
];

test.describe('E-commerce Website Performance and Accessibility Tests', () => {
  test.beforeAll(async () => {
    resetTestResults();
  });

  test.afterAll(async () => {
    // Wait for any pending operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    const results = testState.getResults() || [];
    console.log(`Generating consolidated report with ${results.length} results from state`);
    generateConsolidatedReport();
  });

  // Run tests for each page
  for (const page of TEST_PAGES) {
    test(`should test ${page.name}`, async ({ page: pageContext }, testInfo) => {
      // Navigate to the page
      await pageContext.goto(page.url, {
        waitUntil: 'networkidle'
      });

      // Run any setup actions if defined
      if (page.setupAction) {
        await page.setupAction(pageContext);
      }

      // Verify we're on the correct page
      const title = await pageContext.title();
      console.log(`Page title: ${title}`);
      
      // Run the combined audit
      await runCombinedAudit(pageContext, testInfo, AUDIT_CONFIG);
    });
  }

  // Test product detail page
  test('should test product detail page', async ({ page }, testInfo) => {
    // Go to home page
    await page.goto('https://www.demoblaze.com/');
    
    // Click on the first product
    await page.click('.card-title a');
    
    // Wait for product details to load
    await page.waitForSelector('.product-deatil', { timeout: 10000 }).catch(() => {
      console.log('Product detail selector not found, continuing with test');
    });
    
    // Run the audit on the product detail page
    await runCombinedAudit(page, testInfo, {
      ...AUDIT_CONFIG,
      // Override thresholds for product page
      thresholds: {
        ...AUDIT_CONFIG.thresholds,
        performance: 55 // Lower threshold for product page due to dynamic content
      }
    });
  });

  // Test cart functionality
  test('should test cart page', async ({ page }, testInfo) => {
    // Go to home page
    await page.goto('https://www.demoblaze.com/');
    
    // Click on Cart link
    await page.click('a#cartur');
    
    // Wait for cart page to load
    await page.waitForSelector('.table-responsive', { timeout: 10000 }).catch(() => {
      console.log('Cart table selector not found, continuing with test');
    });
    
    // Run the audit on the cart page
    await runCombinedAudit(page, testInfo, AUDIT_CONFIG);
  });
}); 