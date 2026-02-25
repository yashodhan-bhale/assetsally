/** Default pagination values */
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
};
/** JWT token configuration */
export declare const JWT: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly MOBILE_REFRESH_TOKEN_EXPIRY: "30d";
};
/** Photo compression settings */
export declare const PHOTO: {
    readonly MAX_SIZE_BYTES: number;
    readonly QUALITY: 0.8;
    readonly MAX_WIDTH: 1920;
    readonly MAX_HEIGHT: 1920;
    readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
};
/** Sync queue configuration */
export declare const SYNC: {
    readonly BATCH_SIZE: 10;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY_MS: 1000;
    readonly IMAGE_BATCH_SIZE: 5;
};
/** Location tree configuration */
export declare const LOCATION: {
    readonly MAX_DEPTH: 4;
    readonly PATH_SEPARATOR: ".";
};
/** API routes */
export declare const API_ROUTES: {
    readonly LOGIN: "/auth/login";
    readonly LOGOUT: "/auth/logout";
    readonly REFRESH: "/auth/refresh";
    readonly USERS: "/users";
    readonly LOCATIONS: "/locations";
    readonly LOCATIONS_TREE: "/locations/tree";
    readonly DEPARTMENTS: "/departments";
    readonly INVENTORY: "/inventory";
    readonly QR_CODES: "/qr-codes";
    readonly QR_CODES_BATCH: "/qr-codes/batch";
    readonly QR_CODES_BIND: "/qr-codes/bind";
    readonly AUDITS: "/audits";
    readonly AUDIT_FINDINGS: "/audits/:id/findings";
    readonly AUDIT_SUBMIT: "/audits/:id/submit";
    readonly AUDIT_APPROVE: "/audits/:id/approve";
    readonly AUDIT_REJECT: "/audits/:id/reject";
    readonly IMPORT_LOCATIONS: "/imports/locations";
    readonly IMPORT_INVENTORY: "/imports/inventory";
    readonly REPORTS: "/reports";
    readonly SYNC_PULL: "/sync/pull";
    readonly SYNC_PUSH: "/sync/push";
};
/** Error codes */
export declare const ERROR_CODES: {
    readonly INVALID_CREDENTIALS: "AUTH_001";
    readonly TOKEN_EXPIRED: "AUTH_002";
    readonly TOKEN_INVALID: "AUTH_003";
    readonly INSUFFICIENT_PERMISSIONS: "AUTH_004";
    readonly NOT_FOUND: "RES_001";
    readonly ALREADY_EXISTS: "RES_002";
    readonly VALIDATION_FAILED: "RES_003";
    readonly LOCATION_LOCKED: "LOC_001";
    readonly LOCATION_NOT_SCHEDULED: "LOC_002";
    readonly LOCATION_ACCESS_DENIED: "LOC_003";
    readonly QR_ALREADY_ASSIGNED: "QR_001";
    readonly QR_NOT_FOUND: "QR_002";
    readonly QR_RETIRED: "QR_003";
    readonly AUDIT_ALREADY_SUBMITTED: "AUDIT_001";
    readonly AUDIT_NOT_SUBMITTED: "AUDIT_002";
    readonly IMPORT_INVALID_FORMAT: "IMP_001";
    readonly IMPORT_VALIDATION_FAILED: "IMP_002";
    readonly INTERNAL_ERROR: "SRV_001";
    readonly DATABASE_ERROR: "SRV_002";
    readonly STORAGE_ERROR: "SRV_003";
};
//# sourceMappingURL=index.d.ts.map