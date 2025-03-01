/**
 * Global state for test results
 */
class TestState {
  constructor() {
    this.reset();
  }

  reset() {
    this.testResults = [];
  }

  addResult(result) {
    this.testResults.push(result);
    console.log(`Added test result for "${result.testName}". Current test results count: ${this.testResults.length}`);
  }

  getResults() {
    return this.testResults;
  }
}

// Export singleton instance
module.exports = new TestState(); 