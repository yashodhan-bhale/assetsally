/** App types for user authentication */
export declare enum AppType {
    ADMIN = "ADMIN",
    CLIENT = "CLIENT",
    MOBILE = "MOBILE"
}
/** User roles within Admin app */
export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN"
}
/** User roles within Mobile app (Auditor) */
export declare enum AuditorRole {
    AUDITOR = "AUDITOR"
}
/** Status of a user account */
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
/** Status of a QR code tag */
export declare enum QRTagStatus {
    UNASSIGNED = "UNASSIGNED",
    ASSIGNED = "ASSIGNED",
    RETIRED = "RETIRED"
}
/** Verification status of an inventory item */
export declare enum VerificationStatus {
    PENDING = "PENDING",
    FOUND = "FOUND",
    NOT_FOUND = "NOT_FOUND",
    RELOCATED = "RELOCATED",
    DAMAGED = "DAMAGED",
    DISPOSED = "DISPOSED"
}
/** Condition of an inventory item */
export declare enum ItemCondition {
    GOOD = "GOOD",
    FAIR = "FAIR",
    POOR = "POOR",
    NON_FUNCTIONAL = "NON_FUNCTIONAL"
}
/** Status of an audit report */
export declare enum AuditReportStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
/** Types of custom fields */
export declare enum CustomFieldType {
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    DATE = "DATE",
    DROPDOWN = "DROPDOWN",
    CHECKBOX = "CHECKBOX",
    PHOTO = "PHOTO"
}
/** Priority levels for sync queue */
export declare enum SyncPriority {
    HIGH = 1,// Text data
    MEDIUM = 2,// Metadata
    LOW = 3
}
/** Status of sync queue items */
export declare enum SyncStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
/** Status of background generation jobs */
export declare enum JobStatus {
    PENDING = "PENDING",
    GENERATING = "GENERATING",
    READY = "READY",
    DOWNLOADED = "DOWNLOADED",
    FAILED = "FAILED"
}
/** Base entity with common fields */
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
/** User entity */
export interface User extends BaseEntity {
    email: string;
    name: string;
    appType: AppType;
    role: string;
    status: UserStatus;
    assignedLocationId?: string;
    departmentIds: string[];
    allDepartmentsAccess: boolean;
}
/** Location entity */
export interface Location extends BaseEntity {
    code: string;
    name: string;
    path: string;
    parentId?: string;
    depth: number;
    levelLabel: string;
    isLocked: boolean;
    scheduledDate?: Date;
}
/** Department entity */
export interface Department extends BaseEntity {
    code: string;
    name: string;
}
/** Inventory item entity */
export interface InventoryItem extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    locationId: string;
    departmentId?: string;
    categoryId?: string;
    customFields: Record<string, unknown>;
    qrTagId?: string;
}
/** QR Code tag entity */
export interface QRCodeTag extends BaseEntity {
    code: string;
    url?: string;
    hashString?: string;
    status: QRTagStatus;
    linkedItemId?: string;
    batchId?: string;
}
/** QR Generation Job */
export interface QRGenerationJob extends BaseEntity {
    baseUrl: string;
    totalCount: number;
    batchSize: number;
    status: JobStatus;
    createdBy: string;
}
/** QR Batch Entity */
export interface QRBatch extends BaseEntity {
    jobId: string;
    batchNumber: number;
    count: number;
    status: JobStatus;
    pdfStoragePath?: string;
}
/** QR Binding Record Entity */
export interface QRBindingRecord extends BaseEntity {
    qrTagId: string;
    itemId: string;
    itemSnapshot: Record<string, unknown>;
    url: string;
    boundBy: string;
    boundAt: Date;
}
/** Audit report entity */
export interface AuditReport extends BaseEntity {
    locationId: string;
    auditorId: string;
    status: AuditReportStatus;
    submittedAt?: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
}
/** Audit finding entity */
export interface AuditFinding extends BaseEntity {
    reportId: string;
    itemId: string;
    status: VerificationStatus;
    condition?: ItemCondition;
    notes?: string;
    geoLat?: number;
    geoLng?: number;
    geoAccuracy?: number;
    customFieldValues: Record<string, unknown>;
}
/** Audit photo entity */
export interface AuditPhoto extends BaseEntity {
    findingId: string;
    storagePath: string;
    originalFilename: string;
    sizeBytes: number;
    mimeType: string;
}
/** Custom field definition */
export interface CustomFieldDefinition extends BaseEntity {
    name: string;
    type: CustomFieldType;
    categoryId?: string;
    required: boolean;
    options?: string[];
    order: number;
}
/** Asset category */
export interface AssetCategory extends BaseEntity {
    code: string;
    name: string;
}
/** Client role with permissions */
export interface ClientRole extends BaseEntity {
    name: string;
    locationScope?: string;
    departmentScope: string[];
    permissions: ClientPermissions;
}
/** Client role permissions */
export interface ClientPermissions {
    canView: boolean;
    canFlag: boolean;
    canRemark: boolean;
    canApprove: boolean;
    canReject: boolean;
}
/** Standard API response wrapper */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}
/** API error details */
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
/** Pagination metadata */
export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
/** Paginated request parameters */
export interface PaginatedRequest {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}
/** Login request */
export interface LoginRequest {
    email: string;
    password: string;
    appType: AppType;
}
/** Login response */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: Pick<User, "id" | "email" | "name" | "role" | "appType">;
}
/** JWT payload */
export interface JwtPayload {
    sub: string;
    email: string;
    appType: AppType;
    role: string;
    locationId?: string;
    departmentIds?: string[];
    allDepts?: boolean;
    iat: number;
    exp: number;
}
/** Refresh token request */
export interface RefreshTokenRequest {
    refreshToken: string;
}
//# sourceMappingURL=index.d.ts.map