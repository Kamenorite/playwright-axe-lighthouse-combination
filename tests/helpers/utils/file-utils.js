const fs = require('fs');
const path = require('path');

/**
 * Gets a formatted timestamp string
 * @returns {string} Formatted timestamp
 */
function getFormattedTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '-')
    .replace('Z', '');
}

/**
 * Formats a timestamp for display
 * @param {string} timestamp - Timestamp string
 * @returns {string} Formatted date string
 */
function formatDisplayDate(timestamp) {
  const [date, time] = timestamp.split('T');
  if (!time) {
    // Handle our custom format: 2025-03-01-10-18-18-899
    const parts = timestamp.split('-');
    if (parts.length === 7) {
      const [year, month, day, hour, minute, second, ms] = parts;
      return new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms)).toUTCString();
    }
  }
  return new Date(timestamp).toUTCString();
}

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Moves a file from source to target path
 * @param {string} sourcePath - Source file path
 * @param {string} targetPath - Target file path
 */
function moveFile(sourcePath, targetPath) {
  // Ensure target directory exists
  ensureDirectoryExists(path.dirname(targetPath));

  // Wait for the source file to exist
  let retries = 0;
  const maxRetries = 10;
  const retryInterval = 500; // 500ms

  while (!fs.existsSync(sourcePath) && retries < maxRetries) {
    retries++;
    console.log(`Waiting for ${sourcePath} to exist... (attempt ${retries}/${maxRetries})`);
    // Sleep for retryInterval milliseconds
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, retryInterval);
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file ${sourcePath} does not exist after ${maxRetries} retries`);
  }

  // Move the file
  fs.renameSync(sourcePath, targetPath);
}

module.exports = {
  getFormattedTimestamp,
  formatDisplayDate,
  ensureDirectoryExists,
  moveFile
}; 