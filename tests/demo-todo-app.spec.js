// @ts-check
const { test, expect } = require('@playwright/test')
const { runCombinedAudit, resetTestResults, generateConsolidatedReport, testState } = require('./helpers')

// Test data and configuration
const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment',
]

const AUDIT_CONFIG = {
  deviceSettings: {
    mobile: false,
    width: 1280,
    height: 720
  },
  throttlingSettings: {
    downloadThroughputKbps: 5120,
    uploadThroughputKbps: 1024,
    latencyMs: 30
  }
}

// Helper functions
async function createDefaultTodos(page) {
  const newTodo = page.getByPlaceholder('What needs to be done?')
  for (const item of TODO_ITEMS) {
    await newTodo.fill(item)
    await newTodo.press('Enter')
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} expected
 */
async function checkNumberOfTodosInLocalStorage(page, expected) {
  return await page.waitForFunction((e) => {
    return JSON.parse(localStorage['react-todos']).length === e
  }, expected)
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} expected
 */
async function checkNumberOfCompletedTodosInLocalStorage(page, expected) {
  return await page.waitForFunction((e) => {
    return (
      JSON.parse(localStorage['react-todos']).filter((i) => i.completed)
        .length === e
    )
  }, expected)
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} title
 */
async function checkTodosInLocalStorage(page, title) {
  return await page.waitForFunction((t) => {
    return JSON.parse(localStorage['react-todos'])
      .map((i) => i.title)
      .includes(t)
  }, title)
}

// Common test setup
test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc')
})

// Test suites
test.describe('Todo List Core Functionality', () => {
  // These tests can run in parallel
  test.describe.configure({ mode: 'parallel' });
  
  test('should allow adding and managing todo items', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?')
    
    // Add todos
    await newTodo.fill(TODO_ITEMS[0])
    await newTodo.press('Enter')
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]])
    
    await newTodo.fill(TODO_ITEMS[1])
    await newTodo.press('Enter')
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]])
    
    // Check completion
    const firstTodo = page.getByTestId('todo-item').nth(0)
    await firstTodo.getByRole('checkbox').check()
    await expect(firstTodo).toHaveClass('completed')
    
    // Edit todo
    await firstTodo.dblclick()
    await firstTodo.getByRole('textbox', { name: 'Edit' }).fill('updated task')
    await firstTodo.getByRole('textbox', { name: 'Edit' }).press('Enter')
    await expect(firstTodo).toHaveText('updated task')
    
    // Verify storage
    await checkNumberOfTodosInLocalStorage(page, 2)
    await checkNumberOfCompletedTodosInLocalStorage(page, 1)
  })

  test('should handle filtering and routing', async ({ page }) => {
    await createDefaultTodos(page)
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check()
    
    // Test filters
    await page.getByRole('link', { name: 'Active' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(2)
    
    await page.getByRole('link', { name: 'Completed' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(1)
    
    await page.getByRole('link', { name: 'All' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(3)
    
    // Verify active filter highlighting
    await expect(page.getByRole('link', { name: 'All' })).toHaveClass('selected')
  })
})

// Lighthouse tests run in sequence to avoid port conflicts
test.describe('Accessibility and Performance Tests', () => {
  // Initialize state at the beginning of the test suite
  test.beforeAll(async () => {
    resetTestResults()
  })

  // Generate report after all tests have completed
  test.afterAll(async () => {
    // Add a small delay to ensure all results are collected
    await new Promise(resolve => setTimeout(resolve, 1000))
    const results = testState.getResults() || [];
    console.log(`Generating consolidated report with ${results.length} results from state`)
    generateConsolidatedReport()
  })

  const testStates = [
    {
      name: 'empty todo list',
      setup: async () => {},
    },
    {
      name: 'todo list with items',
      setup: async (page) => {
        await createDefaultTodos(page)
      },
    },
    {
      name: 'todo list with completed items',
      setup: async (page) => {
        await createDefaultTodos(page)
        await page.getByLabel('Toggle Todo').first().check()
        await page.getByLabel('Toggle Todo').nth(1).check()
      },
    },
  ]

  for (const state of testStates) {
    test(`should test ${state.name}`, async ({ page }, testInfo) => {
      await page.goto('https://demo.playwright.dev/todomvc')
      await state.setup(page)
      await runCombinedAudit(page, testInfo, AUDIT_CONFIG)
    })
  }

  test('should test filtered views', async ({ page }, testInfo) => {
    await createDefaultTodos(page)
    await page.getByLabel('Toggle Todo').first().check()
    
    for (const filter of ['Active', 'Completed', 'All']) {
      await page.getByRole('link', { name: filter }).click()
      await runCombinedAudit(page, testInfo, AUDIT_CONFIG)
    }
  })
})
