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
    'max-len': ['error', { 
      code: 120,
      ignoreTemplateLiterals: true, // Ignore template literals
      ignoreStrings: true // Ignore strings
    }], 
    'comma-dangle': ['error', 'always-multiline'], // Enforce trailing commas in multiline
    'no-param-reassign': ['error', { props: false }], // Allow param reassignment for props
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // Allow dev dependencies
    'no-underscore-dangle': 'off', // Allow underscore dangle for private methods/properties
    'import/extensions': ['error', 'ignorePackages'], // Allow .js extensions in imports for ES modules
    'no-use-before-define': ['error', { functions: false }], // Allow function hoisting
    'no-await-in-loop': 'off', // Allow await in loops for this project
    'no-plusplus': 'off', // Allow ++ operator
    'class-methods-use-this': 'off', // Allow class methods that don't use 'this'
    'no-promise-executor-return': 'off', // Allow returning values from promise executors
    'no-restricted-syntax': 'off', // Allow for...of loops
    'import/prefer-default-export': 'off', // Allow named exports
    'radix': 'off', // Allow parseInt without radix
    'no-return-assign': 'off', // Allow return assignments
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_', // Ignore args starting with underscore
      varsIgnorePattern: '^_', // Ignore vars starting with underscore
      ignoreRestSiblings: true, // Ignore rest siblings
      args: 'none' // Ignore all function args
    }],
  },
  ignorePatterns: [
    'node_modules/',
    'playwright-report/',
    'test-results/',
    'reports/',
  ],
};
