import { PaginationMeta, PAGINATION } from "../";

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  totalItems: number,
  page: number = PAGINATION.DEFAULT_PAGE,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): PaginationMeta {
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
export function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Check if a date is today
 */
export function isToday(date: Date, timezone?: string): boolean {
  const today = new Date();
  return formatDateOnly(date) === formatDateOnly(today);
}

/**
 * Generate a materialized path from parent path and current code
 */
export function generateLocationPath(
  parentPath: string | null,
  code: string,
): string {
  if (!parentPath) {
    return code;
  }
  return `${parentPath}.${code}`;
}

/**
 * Check if a path is a descendant of another path
 */
export function isDescendantPath(
  childPath: string,
  parentPath: string,
): boolean {
  return childPath.startsWith(`${parentPath}.`) || childPath === parentPath;
}

/**
 * Get the depth of a location path
 */
export function getPathDepth(path: string): number {
  return path.split(".").length;
}

/**
 * Sanitize a string for use as a code (alphanumeric, uppercase)
 */
export function sanitizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
}

/**
 * Generate a unique ID (for client-side use)
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Delay execution (for retry logic)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

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
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}
