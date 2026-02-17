// Application constants

/** Default pagination values */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** JWT token configuration */
export const JWT = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  MOBILE_REFRESH_TOKEN_EXPIRY: "30d", // Longer for mobile persistent login
} as const;

/** Photo compression settings */
export const PHOTO = {
  MAX_SIZE_BYTES: 500 * 1024, // 500KB
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/** Sync queue configuration */
export const SYNC = {
  BATCH_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  IMAGE_BATCH_SIZE: 5,
} as const;

/** Location tree configuration */
export const LOCATION = {
  MAX_DEPTH: 5,
  PATH_SEPARATOR: ".",
} as const;

/** API routes */
export const API_ROUTES = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",

  // Users
  USERS: "/users",

  // Locations
  LOCATIONS: "/locations",
  LOCATIONS_TREE: "/locations/tree",

  // Departments
  DEPARTMENTS: "/departments",

  // Inventory
  INVENTORY: "/inventory",

  // QR Codes
  QR_CODES: "/qr-codes",
  QR_CODES_BATCH: "/qr-codes/batch",
  QR_CODES_BIND: "/qr-codes/bind",

  // Audits
  AUDITS: "/audits",
  AUDIT_FINDINGS: "/audits/:id/findings",
  AUDIT_SUBMIT: "/audits/:id/submit",
  AUDIT_APPROVE: "/audits/:id/approve",
  AUDIT_REJECT: "/audits/:id/reject",

  // Imports
  IMPORT_LOCATIONS: "/imports/locations",
  IMPORT_INVENTORY: "/imports/inventory",

  // Reports
  REPORTS: "/reports",

  // Sync (mobile)
  SYNC_PULL: "/sync/pull",
  SYNC_PUSH: "/sync/push",
} as const;

/** Error codes */
export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: "AUTH_001",
  TOKEN_EXPIRED: "AUTH_002",
  TOKEN_INVALID: "AUTH_003",
  INSUFFICIENT_PERMISSIONS: "AUTH_004",

  // Resource errors
  NOT_FOUND: "RES_001",
  ALREADY_EXISTS: "RES_002",
  VALIDATION_FAILED: "RES_003",

  // Location errors
  LOCATION_LOCKED: "LOC_001",
  LOCATION_NOT_SCHEDULED: "LOC_002",
  LOCATION_ACCESS_DENIED: "LOC_003",

  // QR errors
  QR_ALREADY_ASSIGNED: "QR_001",
  QR_NOT_FOUND: "QR_002",
  QR_RETIRED: "QR_003",

  // Audit errors
  AUDIT_ALREADY_SUBMITTED: "AUDIT_001",
  AUDIT_NOT_SUBMITTED: "AUDIT_002",

  // Import errors
  IMPORT_INVALID_FORMAT: "IMP_001",
  IMPORT_VALIDATION_FAILED: "IMP_002",

  // Server errors
  INTERNAL_ERROR: "SRV_001",
  DATABASE_ERROR: "SRV_002",
  STORAGE_ERROR: "SRV_003",
} as const;
