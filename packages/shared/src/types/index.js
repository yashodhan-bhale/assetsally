"use strict";
// ============================================================================
// Enums
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = exports.SyncStatus = exports.SyncPriority = exports.CustomFieldType = exports.AuditReportStatus = exports.ItemCondition = exports.VerificationStatus = exports.QRTagStatus = exports.UserStatus = exports.AuditorRole = exports.AdminRole = exports.AppType = void 0;
/** App types for user authentication */
var AppType;
(function (AppType) {
    AppType["ADMIN"] = "ADMIN";
    AppType["CLIENT"] = "CLIENT";
    AppType["MOBILE"] = "MOBILE";
})(AppType || (exports.AppType = AppType = {}));
/** User roles within Admin app */
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
/** User roles within Mobile app (Auditor) */
var AuditorRole;
(function (AuditorRole) {
    AuditorRole["AUDITOR"] = "AUDITOR";
})(AuditorRole || (exports.AuditorRole = AuditorRole = {}));
/** Status of a user account */
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
/** Status of a QR code tag */
var QRTagStatus;
(function (QRTagStatus) {
    QRTagStatus["UNASSIGNED"] = "UNASSIGNED";
    QRTagStatus["ASSIGNED"] = "ASSIGNED";
    QRTagStatus["RETIRED"] = "RETIRED";
})(QRTagStatus || (exports.QRTagStatus = QRTagStatus = {}));
/** Verification status of an inventory item */
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["FOUND"] = "FOUND";
    VerificationStatus["NOT_FOUND"] = "NOT_FOUND";
    VerificationStatus["RELOCATED"] = "RELOCATED";
    VerificationStatus["DAMAGED"] = "DAMAGED";
    VerificationStatus["DISPOSED"] = "DISPOSED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
/** Condition of an inventory item */
var ItemCondition;
(function (ItemCondition) {
    ItemCondition["GOOD"] = "GOOD";
    ItemCondition["FAIR"] = "FAIR";
    ItemCondition["POOR"] = "POOR";
    ItemCondition["NON_FUNCTIONAL"] = "NON_FUNCTIONAL";
})(ItemCondition || (exports.ItemCondition = ItemCondition = {}));
/** Status of an audit report */
var AuditReportStatus;
(function (AuditReportStatus) {
    AuditReportStatus["DRAFT"] = "DRAFT";
    AuditReportStatus["SUBMITTED"] = "SUBMITTED";
    AuditReportStatus["APPROVED"] = "APPROVED";
    AuditReportStatus["REJECTED"] = "REJECTED";
})(AuditReportStatus || (exports.AuditReportStatus = AuditReportStatus = {}));
/** Types of custom fields */
var CustomFieldType;
(function (CustomFieldType) {
    CustomFieldType["TEXT"] = "TEXT";
    CustomFieldType["NUMBER"] = "NUMBER";
    CustomFieldType["DATE"] = "DATE";
    CustomFieldType["DROPDOWN"] = "DROPDOWN";
    CustomFieldType["CHECKBOX"] = "CHECKBOX";
    CustomFieldType["PHOTO"] = "PHOTO";
})(CustomFieldType || (exports.CustomFieldType = CustomFieldType = {}));
/** Priority levels for sync queue */
var SyncPriority;
(function (SyncPriority) {
    SyncPriority[SyncPriority["HIGH"] = 1] = "HIGH";
    SyncPriority[SyncPriority["MEDIUM"] = 2] = "MEDIUM";
    SyncPriority[SyncPriority["LOW"] = 3] = "LOW";
})(SyncPriority || (exports.SyncPriority = SyncPriority = {}));
/** Status of sync queue items */
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "PENDING";
    SyncStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SyncStatus["COMPLETED"] = "COMPLETED";
    SyncStatus["FAILED"] = "FAILED";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
/** Status of background generation jobs */
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "PENDING";
    JobStatus["GENERATING"] = "GENERATING";
    JobStatus["READY"] = "READY";
    JobStatus["DOWNLOADED"] = "DOWNLOADED";
    JobStatus["FAILED"] = "FAILED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
//# sourceMappingURL=index.js.map