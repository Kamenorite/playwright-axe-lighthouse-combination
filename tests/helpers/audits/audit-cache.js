/**
 * Cache for storing audit results by URL
 */
class AuditCache {
  constructor() {
    this.cache = new Map();
    this.lighthouseRuns = new Map();
  }

  /**
   * Get cached audit results for a URL
   * @param {string} url - The URL to get results for
   * @param {string} state - Optional state identifier (e.g., 'empty', 'with-items', 'completed')
   * @returns {Object|null} Cached results or null if not found
   */
  get(url, state = '') {
    const key = this._getCacheKey(url, state);
    return this.cache.get(key) || null;
  }

  /**
   * Get all Lighthouse runs for a URL
   * @param {string} url - The URL to get results for
   * @param {string} state - Optional state identifier
   * @returns {Array} Array of Lighthouse results
   */
  getLighthouseRuns(url, state = '') {
    const key = this._getCacheKey(url, state);
    return this.lighthouseRuns.get(key) || [];
  }

  /**
   * Add a Lighthouse run result
   * @param {string} url - The URL to store results for
   * @param {Object} results - The Lighthouse results to store
   * @param {string} state - Optional state identifier
   */
  addLighthouseRun(url, results, state = '') {
    const key = this._getCacheKey(url, state);
    const runs = this.getLighthouseRuns(url, state);
    runs.push(results);
    this.lighthouseRuns.set(key, runs);
  }

  /**
   * Store audit results for a URL
   * @param {string} url - The URL to store results for
   * @param {Object} results - The audit results to store
   * @param {string} state - Optional state identifier
   */
  set(url, results, state = '') {
    const key = this._getCacheKey(url, state);
    this.cache.set(key, results);
  }

  /**
   * Check if results exist for a URL
   * @param {string} url - The URL to check
   * @param {string} state - Optional state identifier
   * @returns {boolean} Whether results exist
   */
  has(url, state = '') {
    const key = this._getCacheKey(url, state);
    return this.cache.has(key);
  }

  /**
   * Check if we have enough Lighthouse runs for a URL
   * @param {string} url - The URL to check
   * @param {string} state - Optional state identifier
   * @param {number} requiredRuns - Number of required runs
   * @returns {boolean} Whether we have enough runs
   */
  hasEnoughLighthouseRuns(url, state = '', requiredRuns = 3) {
    const runs = this.getLighthouseRuns(url, state);
    return runs.length >= requiredRuns;
  }

  /**
   * Clear all cached results
   */
  clear() {
    this.cache.clear();
    this.lighthouseRuns.clear();
  }

  /**
   * Generate a cache key from URL and state
   * @private
   */
  _getCacheKey(url, state) {
    return `${url}#${state}`;
  }
}

// Export singleton instance
module.exports = new AuditCache(); 