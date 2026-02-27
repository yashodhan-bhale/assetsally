"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
exports.formatDateOnly = formatDateOnly;
exports.isToday = isToday;
exports.generateLocationPath = generateLocationPath;
exports.isDescendantPath = isDescendantPath;
exports.getPathDepth = getPathDepth;
exports.sanitizeCode = sanitizeCode;
exports.generateId = generateId;
exports.isValidEmail = isValidEmail;
exports.formatFileSize = formatFileSize;
exports.delay = delay;
exports.withRetry = withRetry;
exports.groupBy = groupBy;
exports.deepClone = deepClone;
exports.pick = pick;
exports.omit = omit;
const __1 = require("../");
/**
 * Calculate pagination metadata
 */
function calculatePagination(
  totalItems,
  page = __1.PAGINATION.DEFAULT_PAGE,
  pageSize = __1.PAGINATION.DEFAULT_PAGE_SIZE,
) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}
/**
 * Format a date to ISO string without time
 */
function formatDateOnly(date) {
  return date.toISOString().split("T")[0];
}
/**
 * Check if a date is today
 */
function isToday(date, timezone) {
  const today = new Date();
  return formatDateOnly(date) === formatDateOnly(today);
}
/**
 * Generate a materialized path from parent path and current code
 */
function generateLocationPath(parentPath, code) {
  if (!parentPath) {
    return code;
  }
  return `${parentPath}.${code}`;
}
/**
 * Check if a path is a descendant of another path
 */
function isDescendantPath(childPath, parentPath) {
  return childPath.startsWith(`${parentPath}.`) || childPath === parentPath;
}
/**
 * Get the depth of a location path
 */
function getPathDepth(path) {
  return path.split(".").length;
}
/**
 * Sanitize a string for use as a code (alphanumeric, uppercase)
 */
function sanitizeCode(input) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
}
/**
 * Generate a unique ID (for client-side use)
 */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
/**
 * Delay execution (for retry logic)
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await delay(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
}
/**
 * Group an array by a key
 */
function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
/**
 * Pick specific keys from an object
 */
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
/**
 * Omit specific keys from an object
 */
function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}
//# sourceMappingURL=index.js.map
