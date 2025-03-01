# Playwright Axe and Lighthouse framework

This repository demonstrates how to implement comprehensive accessibility and performance testing using Playwright, Lighthouse, and Axe. It showcases automated testing that covers both accessibility compliance and core web vitals metrics.

## Features

- 🎭 **Playwright Integration**: Automated browser testing with Playwright
- ⚡ **Performance Testing**: Lighthouse audits for Core Web Vitals
  - Largest Contentful Paint (LCP)
  - First Contentful Paint (FCP)
  - Time to First Byte (TTFB)
  - Total Blocking Time (TBT)
  - Cumulative Layout Shift (CLS)
  - Time to Interactive (TTI)
- ♿ **Accessibility Testing**: Automated accessibility audits using Axe
  - WCAG 2.0 and 2.1 compliance checks
  - Severity-based violation reporting
  - Detailed remediation suggestions
- 📊 **Consolidated Reporting**:
  - HTML reports with interactive UI
  - JSON reports for CI/CD integration
  - Datadog-friendly metrics format
  - Multi-run performance averaging
  - Threshold visualization and breach detection
- 🚀 **Advanced Features**:
  - State Management System for test results
  - URL-based Audit Caching
  - Multiple Lighthouse runs for stable metrics
  - Configurable performance thresholds
  - Page state detection for smarter caching
- ⚡ **Optimized Test Execution**:
  - Smart parallel test execution
  - Separate workers for functional and performance tests
  - Configurable parallelization based on test type
  - Efficient state management for parallel tests
- 🛒 **Demo Test Suites**:
  - Todo App functionality tests
  - E-commerce website performance tests
  - Cross-browser compatibility

## Code Conventions

This project uses several tools to enforce code quality and consistency:

### ESLint with Airbnb Configuration

We use ESLint with the Airbnb style guide to enforce consistent code style:

```bash
# Run ESLint
npm run lint

# Fix automatically fixable issues
npm run lint:fix
```

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This helps in generating changelogs and understanding the changes at a glance.

Use the following command to create a commit with the proper format:

```bash
npm run commit
```

This will launch an interactive CLI that guides you through creating a properly formatted commit message.

Commit types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools
- `a11y`: Accessibility improvements

### Git Hooks with Lefthook

We use Lefthook to manage Git hooks:

- **pre-commit**: Runs ESLint and Prettier on staged files
- **commit-msg**: Validates commit messages against conventional commit format
- **pre-push**: Runs functional tests before pushing

These hooks are automatically installed when you run `npm install`.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/playwright_practice.git
cd playwright_practice
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred settings
```

## Environment Variables

The following environment variables can be configured in your `.env` file or set directly in your CI/CD pipeline:

### Feature Flags

- `ENABLE_LIGHTHOUSE`: Enable Lighthouse performance audits (default: true)
- `ENABLE_AXE`: Enable Axe accessibility audits (default: true)

### Device Emulation

- `LIGHTHOUSE_MOBILE`: Enable mobile device emulation (default: false)
- `LIGHTHOUSE_DEVICE_SCALE`: Device scale factor (default: 1)
- `LIGHTHOUSE_WIDTH`: Viewport width (default: 1920)
- `LIGHTHOUSE_HEIGHT`: Viewport height (default: 1080)

### Network Throttling

- `LIGHTHOUSE_THROTTLING_METHOD`: Network throttling method ('simulate' or 'devtools', default: 'simulate')
- `LIGHTHOUSE_CPU_SLOWDOWN`: CPU slowdown multiplier (default: 2)
- `LIGHTHOUSE_DOWNLOAD_SPEED`: Download speed in Kbps (default: 2048)
- `LIGHTHOUSE_UPLOAD_SPEED`: Upload speed in Kbps (default: 1024)
- `LIGHTHOUSE_LATENCY`: Network latency in ms (default: 50)

### Test Configuration

- `CI`: Whether running in CI environment (default: false)
- `DEBUG`: Enable debug logging (default: false)
- `SCREENSHOT_ON_FAILURE`: Take screenshots on test failure (default: true)

## Project Structure

```
tests/
├── helpers/              # Test helper modules
│   ├── index.js         # Main entry point
│   ├── audits/          # Audit implementations
│   │   ├── lighthouse-audit.js
│   │   ├── axe-audit.js
│   │   └── audit-cache.js    # Caching system
│   ├── config/          # Configuration settings
│   │   └── audit-config.js
│   ├── reporting/       # Report generation
│   │   └── consolidated-report.js
│   ├── state/          # State management
│   │   └── index.js
│   └── utils/          # Utility functions
│       └── file-utils.js
├── demo-todo-app.spec.js # Todo app test file
└── ecommerce.spec.js    # E-commerce website test file
```

## Usage

### Basic Test Run

Run the accessibility and performance tests:

```bash
ENABLE_LIGHTHOUSE=true ENABLE_AXE=true npx playwright test tests/demo-todo-app.spec.js --project=chromium
```

### Optimized Test Execution

We've added several npm scripts to optimize test execution:

```bash
# Run only functional tests (fast, parallel execution)
npm run test:functional

# Run only accessibility tests
npm run test:a11y

# Run only performance tests
npm run test:perf

# Run all tests with both accessibility and performance checks
npm run test:full

# Run e-commerce website tests
npm run test:ecommerce
```

### Test Optimization Strategy

The test framework implements smart parallelization to optimize execution time:

1. **Functional Tests**: Run in parallel with multiple workers for maximum speed
2. **Lighthouse Tests**: Run sequentially to avoid port conflicts and resource contention
3. **Accessibility Tests**: Can run in parallel when Lighthouse is disabled

This approach is configured in `playwright.config.js`:

```javascript
// Parallel execution configuration
fullyParallel: process.env.ENABLE_LIGHTHOUSE !== 'true',

// Worker configuration
workers: process.env.ENABLE_LIGHTHOUSE === 'true' ? 1 : undefined,
```

Individual test files can also control parallelization:

```javascript
// Enable parallel execution for functional tests
test.describe("Functional Tests", () => {
  test.describe.configure({ mode: "parallel" });

  // Test cases...
});
```

### Demo Test Suites

#### 1. Todo App Tests

The Todo App tests demonstrate how to test a simple web application with both functional tests and performance/accessibility audits:

```bash
# Run Todo App tests
npm run test:functional
```

#### 2. E-commerce Website Tests

The E-commerce tests demonstrate how to test a more complex website with multiple pages and user flows. We use the demoblaze.com demo site, which is a reliable and stable demo e-commerce platform for testing purposes.

```bash
# Run E-commerce tests
npm run test:ecommerce
```

These tests check:

- Home page performance and accessibility
- Product category pages (Phones, Laptops)
- Product detail page metrics
- Cart functionality
- Overall site compliance with WCAG standards

### Using Test Helpers

```javascript
const { runCombinedAudit } = require("./helpers");

test("should be accessible and performant", async ({ page }, testInfo) => {
  await page.goto("https://example.com");

  const results = await runCombinedAudit(page, testInfo, {
    deviceSettings: {
      mobile: true,
      width: 375,
      height: 667,
    },
    throttlingSettings: {
      downloadThroughputKbps: 1024,
      uploadThroughputKbps: 512,
      latencyMs: 100,
    },
  });

  // Access results
  console.log(results.lighthouseResults.metrics);
  console.log(results.axeResults.violations);
});
```

### Configuration Options

#### Device Settings

Configure device emulation via environment variables or options:

```bash
# Environment Variables
LIGHTHOUSE_MOBILE=true
LIGHTHOUSE_DEVICE_SCALE=1
LIGHTHOUSE_WIDTH=1920
LIGHTHOUSE_HEIGHT=1080

# Or in code
const options = {
  deviceSettings: {
    mobile: true,
    deviceScaleFactor: 1,
    width: 1920,
    height: 1080
  }
};
```

#### Network Throttling

Configure network conditions via environment variables or options:

```bash
# Environment Variables
LIGHTHOUSE_THROTTLING_METHOD=simulate
LIGHTHOUSE_CPU_SLOWDOWN=2
LIGHTHOUSE_DOWNLOAD_SPEED=2048
LIGHTHOUSE_UPLOAD_SPEED=1024
LIGHTHOUSE_LATENCY=50

# Or in code
const options = {
  throttlingSettings: {
    throttlingMethod: 'simulate',
    cpuSlowdownMultiplier: 2,
    downloadThroughputKbps: 2048,
    uploadThroughputKbps: 1024,
    latencyMs: 50
  }
};
```

#### Accessibility Testing

Configure accessibility testing in your test files:

```javascript
const options = {
  includedImpacts: ["critical", "serious"],
};
const results = await runAccessibilityAudit(page, options);
```

### Reports

After running tests, find reports in:

- `reports/lighthouse/`: Lighthouse performance reports
- `reports/axe/`: Accessibility audit reports
- `reports/consolidated/`: Combined HTML and JSON reports

## Report Types

### 1. Performance Reports (Lighthouse)

- Detailed Core Web Vitals metrics
- Performance score and recommendations
- Interactive visualizations
- Available in HTML and JSON formats

### 2. Accessibility Reports (Axe)

- WCAG compliance status
- Violation details with remediation steps
- Impact severity classification
- Element-specific recommendations

### 3. Consolidated Reports

- Combined performance and accessibility metrics
- Test run summaries with pass/fail status
- Interactive UI for exploring results
- Links to individual detailed reports

### 4. Datadog Integration

The consolidated JSON reports are formatted to be easily integrated with Datadog. Each test run generates metrics in a Datadog-friendly format with the following structure:

```json
{
  "metrics": [
    {
      "timestamp": "2025-03-01-13-28-20-200",
      "test_name": "should test empty todo list",
      "url_path": "/todomvc/",
      // Performance scores and thresholds
      "perf_threshold": 80,
      "perf_score": 100,
      "a11y_threshold": 90,
      "a11y_score": 90,
      "bp_threshold": 90,
      "bp_score": 96,
      "seo_threshold": 90,
      "seo_score": 90,
      // Core Web Vitals
      "vital_lcp": 0,
      "vital_fid": 0,
      "vital_cls": 0,
      // Additional performance metrics
      "metric_fcp": 0,
      "metric_si": 0,
      "metric_tbt": 0,
      "metric_tti": 0,
      "metric_ttfb": 0,
      // Network metrics
      "network_rtt": 0,
      "network_latency": 0,
      // Resource metrics
      "resource_bytes": 0,
      "resource_dom_nodes": 0,
      // Test metadata
      "device_type": "chromium",
      "viewport_width": 0,
      "viewport_height": 0,
      "is_mobile": false,
      "environment": "ci"
    }
  ]
}
```

#### Datadog Dashboard Examples

1. Performance Score Over Time:

```yaml
{
  "viz": "timeseries",
  "requests":
    [
      {
        "q": "avg:perf_score{*} by {test_name,url_path}",
        "display_type": "line",
      },
    ],
}
```

2. Core Web Vitals Tracking:

```yaml
{
  "viz": "timeseries",
  "requests":
    [
      { "q": "avg:vital_lcp{*} by {url_path}", "display_type": "line" },
      { "q": "avg:vital_fid{*} by {url_path}", "display_type": "line" },
      { "q": "avg:vital_cls{*} by {url_path}", "display_type": "line" },
    ],
}
```

3. Threshold Breach Alerts:

```yaml
{
  "viz": "query_value",
  "requests":
    [
      {
        "q": "avg:perf_score{*} by {test_name,url_path} < by {test_name,url_path}.perf_threshold{*}",
        "conditional_formats":
          [{ "comparator": ">", "value": 0, "palette": "white_on_red" }],
      },
    ],
}
```

#### Setting Up Datadog Integration

1. Install the Datadog agent on your CI/CD server or local machine.
2. Configure your Datadog API key in your environment:

```bash
export DD_API_KEY=your_api_key_here
```

3. Use the Datadog agent to forward metrics:

```bash
# Example using dogstatsd
echo "performance.score:${perf_score}|g|#test_name:${test_name},url_path:${url_path}" | nc -u -w1 127.0.0.1 8125
```

4. Create dashboards in Datadog using the example queries above.

5. Set up alerts based on thresholds:

- Performance score drops below threshold
- Core Web Vitals exceed recommended limits
- Accessibility score falls below compliance requirements

## API Reference

### Main Functions

#### `runCombinedAudit(page, testInfo, options)`

Runs both Lighthouse and Axe audits and generates consolidated reports.

#### `runLighthouseAudit(page, options)`

Runs only the Lighthouse performance audit.

#### `runAccessibilityAudit(page, options)`

Runs only the Axe accessibility audit.

### Configuration Objects

#### Device Settings

```javascript
{
  mobile: boolean,
  deviceScaleFactor: number,
  width: number,
  height: number
}
```

#### Throttling Settings

```javascript
{
  throttlingMethod: 'simulate' | 'devtools',
  cpuSlowdownMultiplier: number,
  downloadThroughputKbps: number,
  uploadThroughputKbps: number,
  latencyMs: number
}
```

## Best Practices

1. **Regular Testing**: Integrate tests into your CI/CD pipeline
2. **Performance Baselines**: Set thresholds for Core Web Vitals
3. **Accessibility First**: Address critical and serious violations immediately
4. **Multiple Runs**: Use averaged results for stable metrics
5. **Mobile Testing**: Test both desktop and mobile configurations
6. **Network Conditions**: Test under various network conditions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Resources

- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

## Advanced Features

### State Management System

The framework includes a robust state management system that:

- Maintains test results throughout the test run
- Provides centralized access to test data
- Ensures consistent report generation
- Tracks test execution progress

```javascript
// Example of state management usage
const { testState } = require("./helpers");

// Reset state before tests
test.beforeAll(async () => {
  testState.reset();
});

// Add test results
testState.addResult(result);

// Generate report using state data
const results = testState.getResults();
```

### Audit Caching System

The framework implements a sophisticated caching system that optimizes test execution by storing and reusing audit results. This significantly reduces test execution time and provides more stable metrics.

#### Key Features

- **URL-based Caching**: Results are cached based on the page URL
- **State-aware**: Cache keys include the page state for more accurate caching
- **Separate Caching for Different Audits**:
  - Axe results (fully cached as they're deterministic)
  - Lighthouse results (partial caching with multiple runs)
- **Intelligent Cache Invalidation**
- **Memory-efficient Storage**

#### Cache Keys

Cache keys are generated using a combination of:

```javascript
const cacheKey = `${url}:${state}`; // Example: "https://example.com/todos:completed"
```

States can be:

- `empty`: No todo items
- `completed`: All items completed
- `mixed`: Some items completed
- `with-items`: Only active items

#### Usage Examples

1. **Basic Cache Usage**:

```javascript
const { auditCache } = require("./helpers/audits/audit-cache");

// Check cache before running audits
if (auditCache.has(url, state)) {
  return auditCache.get(url, state);
}

// Run audit and cache results
const results = await runAudit(page);
auditCache.set(url, results, state);
```

2. **Multiple Lighthouse Runs**:

```javascript
// Check if we have enough Lighthouse runs
if (!auditCache.hasEnoughLighthouseRuns(url, state, REQUIRED_RUNS)) {
  // Run additional Lighthouse audits
  const result = await runLighthouseAudit(page);
  auditCache.addLighthouseRun(url, result, state);
}

// Get all runs for averaging
const allRuns = auditCache.getLighthouseRuns(url, state);
```

3. **Axe Cache Usage**:

```javascript
// Axe results are deterministic, so we can fully cache them
if (auditCache.has(url, state)) {
  const cachedResults = auditCache.get(url, state);
  return cachedResults.axeResults;
}
```

#### Cache Methods

| Method                                          | Description                                   |
| ----------------------------------------------- | --------------------------------------------- |
| `has(url, state)`                               | Checks if results exist for the URL and state |
| `get(url, state)`                               | Retrieves cached results                      |
| `set(url, results, state)`                      | Stores new results in the cache               |
| `clear()`                                       | Clears all cached results                     |
| `hasEnoughLighthouseRuns(url, state, required)` | Checks if enough Lighthouse runs are cached   |
| `addLighthouseRun(url, result, state)`          | Adds a new Lighthouse run to the cache        |
| `getLighthouseRuns(url, state)`                 | Gets all cached Lighthouse runs for averaging |

#### Benefits

1. **Performance Optimization**:

   - Reduces test execution time by ~66% for repeated states
   - Avoids redundant accessibility checks
   - Minimizes browser resource usage

2. **Stable Metrics**:

   - Maintains multiple Lighthouse runs for accuracy
   - Provides consistent results across test runs
   - Supports metric averaging

3. **Resource Efficiency**:

   - Memory-efficient storage
   - Automatic cache invalidation
   - Optimized for CI/CD environments

4. **Smart State Detection**:
   - Automatically identifies page states
   - Ensures accurate result reuse
   - Prevents false positives from cached results

#### Implementation Details

The cache is implemented as a singleton instance:

```javascript
class AuditCache {
  constructor() {
    this.cache = new Map();
    this.lighthouseRuns = new Map();
  }

  // Generate cache key
  #getCacheKey(url, state) {
    return `${url}:${state}`;
  }

  // Store results with state
  set(url, results, state) {
    const key = this.#getCacheKey(url, state);
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  // Retrieve results if they exist
  get(url, state) {
    const key = this.#getCacheKey(url, state);
    const cached = this.cache.get(key);
    return cached?.results;
  }
}
```

### Page State Detection

The framework automatically detects page states for smarter caching:

- Empty state (no items)
- Completed state (all items completed)
- Mixed state (some items completed)
- With items state (active items)

### Performance Thresholds

Configure performance thresholds for metrics:

```javascript
const defaultThresholds = {
  performance: 80,
  accessibility: 90,
  "best-practices": 90,
  seo: 90,
};
```

Reports will:

- Display thresholds alongside actual scores
- Highlight threshold breaches
- Color-code metrics based on threshold comparison
- Track threshold breaches in JSON reports

### Multiple Lighthouse Runs

The framework supports multiple Lighthouse runs for stable metrics:

- Configurable number of runs (default: 3)
- Automatic averaging of scores
- Detailed run statistics in reports
- Cache-aware execution to avoid redundant runs

## Report Enhancements

### HTML Report Features

- Interactive UI with expandable sections
- Color-coded metrics based on thresholds
- Visual indicators for test status
- Links to detailed audit reports
- Summary section with aggregated metrics

### JSON Report Structure

```javascript
{
  timestamp: "2025-03-01-12-24-06-255",
  totalTests: 6,
  thresholds: {
    lighthouse: {
      performance: 80,
      accessibility: 90,
      // ...
    },
    accessibility: {
      critical_violations: 0,
      serious_violations: 0
    }
  },
  summary: {
    totalAccessibilityViolations: 18,
    averageMetrics: {
      // Averaged scores with threshold status
    }
  },
  results: [
    // Detailed test results
  ]
}
```

## Datadog Integration

The framework generates Datadog-friendly metrics in the consolidated JSON report. These metrics are organized into logical groups for easy querying and visualization.

### Metric Categories

1. **Performance Scores**

   - `perf_score`: Overall performance score (0-100)
   - `perf_threshold`: Performance threshold value
   - `a11y_score`: Accessibility score
   - `a11y_threshold`: Accessibility threshold
   - `bp_score`: Best practices score
   - `bp_threshold`: Best practices threshold
   - `seo_score`: SEO score
   - `seo_threshold`: SEO threshold

2. **Core Web Vitals**

   - `vital_lcp`: Largest Contentful Paint
   - `vital_fid`: First Input Delay
   - `vital_cls`: Cumulative Layout Shift

3. **Performance Metrics**

   - `metric_fcp`: First Contentful Paint
   - `metric_si`: Speed Index
   - `metric_tbt`: Total Blocking Time
   - `metric_tti`: Time to Interactive
   - `metric_ttfb`: Time to First Byte

4. **Network Metrics**

   - `network_rtt`: Network Round Trip Time
   - `network_latency`: Server Latency

5. **Resource Metrics**
   - `resource_bytes`: Total Byte Weight
   - `resource_dom_nodes`: DOM Size

### Test Metadata

Each metric includes the following metadata tags:

- `test_name`: Name of the test case
- `url_path`: Path of the URL being tested
- `device_type`: Device used for testing
- `viewport_width`: Viewport width
- `viewport_height`: Viewport height
- `is_mobile`: Whether mobile emulation is enabled
- `environment`: Test environment (ci/local)

### Example Datadog Queries

```sql
# Track performance score trends
avg:lighthouse.perf_score{*} by {url_path}

# Monitor Core Web Vitals
avg:lighthouse.vital_lcp{*} by {test_name}
avg:lighthouse.vital_fid{*} by {test_name}
avg:lighthouse.vital_cls{*} by {test_name}

# Compare environments
avg:lighthouse.network_latency{environment:ci} vs
avg:lighthouse.network_latency{environment:local}

# Track resource usage
avg:lighthouse.resource_bytes{*} by {url_path}
avg:lighthouse.resource_dom_nodes{*} by {url_path}
```

### Dashboard Examples

1. **Performance Overview**

   - Performance score vs threshold
   - Core Web Vitals status
   - Network metrics trends

2. **URL Performance**

   - Performance by URL path
   - Resource usage by page
   - Loading metrics comparison

3. **Environment Comparison**
   - CI vs local performance
   - Network latency differences
   - Resource usage variations

### Best Practices

1. **Metric Collection**

   - Run tests at regular intervals
   - Maintain consistent test conditions
   - Use appropriate thresholds

2. **Monitoring**

   - Set up alerts for threshold breaches
   - Monitor trends over time
   - Compare across environments

3. **Dashboard Organization**
   - Group related metrics
   - Use appropriate visualizations
   - Include threshold indicators
# Test
