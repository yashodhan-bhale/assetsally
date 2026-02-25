import { PaginationMeta } from "../";
/**
 * Calculate pagination metadata
 */
export declare function calculatePagination(totalItems: number, page?: number, pageSize?: number): PaginationMeta;
/**
 * Format a date to ISO string without time
 */
export declare function formatDateOnly(date: Date): string;
/**
 * Check if a date is today
 */
export declare function isToday(date: Date, timezone?: string): boolean;
/**
 * Generate a materialized path from parent path and current code
 */
export declare function generateLocationPath(parentPath: string | null, code: string): string;
/**
 * Check if a path is a descendant of another path
 */
export declare function isDescendantPath(childPath: string, parentPath: string): boolean;
/**
 * Get the depth of a location path
 */
export declare function getPathDepth(path: string): number;
/**
 * Sanitize a string for use as a code (alphanumeric, uppercase)
 */
export declare function sanitizeCode(input: string): string;
/**
 * Generate a unique ID (for client-side use)
 */
export declare function generateId(): string;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Format file size in human-readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Delay execution (for retry logic)
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function withRetry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelayMs?: number): Promise<T>;
/**
 * Group an array by a key
 */
export declare function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Record<K, T[]>;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Pick specific keys from an object
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specific keys from an object
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
//# sourceMappingURL=index.d.ts.map