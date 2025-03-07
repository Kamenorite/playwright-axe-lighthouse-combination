# Playwright Axe and Lighthouse Framework

A robust framework for automated accessibility and performance testing built with Playwright, Lighthouse, and Axe. Easily ensure your web apps meet accessibility standards and perform optimally.

## Key Features

- **🎭 Playwright Integration**: Automated browser testing.
- **⚡ Performance Audits**: Lighthouse checks for Core Web Vitals:
  - Largest Contentful Paint (**LCP**)
  - First Contentful Paint (**FCP**)
  - Time to First Byte (**TTFB**)
  - Total Blocking Time (**TBT**)
  - Cumulative Layout Shift (**CLS**)
  - Time to Interactive (**TTI**)
- **♿ Accessibility Testing**: Axe audits for WCAG 2.0/2.1 compliance with severity-based reporting.
- **📊 Consolidated Reporting**:
  - HTML reports with interactive UI
  - JSON reports for CI/CD integration
  - Datadog-friendly metrics format
  - Threshold visualization and breach detection
- **🚀 Optimized Execution**:
  - Smart parallelization for tests
  - Efficient state management
- **⚡ Caching System**:
  - URL-based Audit Caching
  - Multiple Lighthouse runs for stable metrics
- **🛒 E-commerce Example**:
  - Real-world e-commerce website testing
  - Multiple page types (home, category, product, cart)
  - Cross-browser compatibility testing
- **🔄 Modern JavaScript**:
  - ES Modules for cleaner imports/exports
  - Enhanced code organization
  - Better compatibility with modern tools

---

## Prerequisites

- **Node.js** v22.1.0
- **npm** or **yarn**
- **Google Chrome**

## Node.js Version Management

This project requires Node.js v22.1.0 and uses ES Modules. We provide configuration files for multiple version managers:

### Using nvm (Node Version Manager)

The project includes a `.nvmrc` file that specifies the required Node.js version. If you use [nvm](https://github.com/nvm-sh/nvm), you can automatically switch to the correct version:

```bash
# Install the required Node.js version
nvm install

# Use the version specified in .nvmrc
nvm use
```

### Using asdf

The project includes a `.tool-versions` file for [asdf](https://asdf-vm.com/) users:

```bash
# Install the required Node.js version
asdf install nodejs 22.1.0

# The correct version will be automatically used when in the project directory
# Or you can explicitly use:
asdf exec node --version
```

---

## Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/kamenorite/playwright-axe-lighthouse-combination.git
cd playwright-axe-lighthouse-combination
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

---

## Running Tests

### 🔹 Run E-commerce Tests

```bash
# Run tests in Chromium (default)
npm test

# Run tests in specific browsers
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

The tests will run on a demo e-commerce website (demoblaze.com) and check:

- Home page performance and accessibility
- Product category pages
- Product detail pages
- Cart functionality
- WCAG compliance across all pages

---

## Audit Caching System

The caching system optimizes test execution by reusing audit results, reducing redundant checks, and ensuring more stable metrics.

- **🔹 URL-based & State-Aware**: Cache keys include both the page URL and its state.
- **🔹 Separate Strategies**:
  - Fully caches **Axe results** (since they are deterministic).
  - Partially caches **Lighthouse results** (to support multiple runs and metric averaging).
- **🔹 Smart Invalidation**: Automatically detects changes and refreshes outdated results.

### 🛠 Example Usage

```javascript
// ES Module import example
import auditCache from "./helpers/audits/audit-cache.js";

if (auditCache.has(url, state)) {
  return auditCache.get(url, state);
}
const results = await runAudit(page);
auditCache.set(url, results, state);
```

---

## Project Architecture

This project uses ES Modules for better code organization and compatibility with modern JavaScript tooling.

### Key Implementation Details

- **ES Modules**: All JavaScript files use ES Modules (`import`/`export`) syntax
- **Configuration Files**: Common JS configuration files (like ESLint) use the `.cjs` extension
- **File Extensions**: All local imports include the `.js` extension as required by ES Modules
- **Package.json**: Includes `"type": "module"` to enable ES Modules by default

---

## Contributing

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature-name`)
3. **Commit your changes** (`git commit -m "Add new feature"`)
4. **Push to the branch** (`git push origin feature-name`)
5. **Open a Pull Request**

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

## Related Resources

- 📖 [Playwright Documentation](https://playwright.dev/)
- 🔥 [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- ♿ [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- 📊 [Web Vitals](https://web.dev/vitals/)
- ✅ [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- 📚 [ES Modules in Node.js](https://nodejs.org/api/esm.html)
