module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console logs as this is a testing framework
    'max-len': ['error', { code: 120 }], // Increase max line length to 120
    'comma-dangle': ['error', 'always-multiline'], // Enforce trailing commas in multiline
    'no-param-reassign': ['error', { props: false }], // Allow param reassignment for props
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // Allow dev dependencies
    'no-underscore-dangle': 'off', // Allow underscore dangle for private methods/properties
  },
  ignorePatterns: [
    'node_modules/',
    'playwright-report/',
    'test-results/',
    'reports/',
  ],
};
