import fs from 'fs';
import path from 'path';

/**
 * Gets a formatted timestamp string
 * @returns {string} Formatted timestamp
 */
function getFormattedTimestamp() {
  const now = new Date();
  return now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
}

/**
 * Formats a timestamp into a display date
 * @param {string} timestamp - Timestamp to format
 * @returns {string} Formatted date
 */
function formatDisplayDate(timestamp) {
  // Format: YYYY-MM-DD-HH-MM-SS to readable format
  const parts = timestamp.split('-');
  return `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:${parts[4]}:${parts[5]}`;
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
    console.log(
      `Waiting for ${sourcePath} to exist... (attempt ${retries}/${maxRetries})`,
    );
    // Sleep for retryInterval milliseconds
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, retryInterval);
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Source file ${sourcePath} does not exist after ${maxRetries} retries`,
    );
  }

  // Move the file
  fs.renameSync(sourcePath, targetPath);
}

export {
  getFormattedTimestamp,
  formatDisplayDate,
  ensureDirectoryExists,
  moveFile,
};
