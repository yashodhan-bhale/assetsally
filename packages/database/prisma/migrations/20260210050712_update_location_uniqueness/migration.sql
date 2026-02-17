-- CreateEnum
CREATE TYPE "AppType" AS ENUM ('ADMIN', 'CLIENT', 'MOBILE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "QRTagStatus" AS ENUM ('UNASSIGNED', 'ASSIGNED', 'RETIRED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'FOUND', 'NOT_FOUND', 'RELOCATED', 'DAMAGED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('GOOD', 'FAIR', 'POOR', 'NON_FUNCTIONAL');

-- CreateEnum
CREATE TYPE "AuditReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'CHECKBOX', 'PHOTO');

-- CreateEnum
CREATE TYPE "SyncPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "appType" "AppType" NOT NULL,
    "role" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedLocationId" TEXT,
    "departmentIds" TEXT[],
    "allDepartmentsAccess" BOOLEAN NOT NULL DEFAULT false,
    "clientRoleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "levelLabel" TEXT NOT NULL,
    "parentId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationSchedule" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "isOverrideLocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "categoryId" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodeTag" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "QRTagStatus" NOT NULL DEFAULT 'UNASSIGNED',
    "linkedItemId" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "QRCodeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "status" "AuditReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditFinding" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "condition" "ItemCondition",
    "notes" TEXT,
    "geoLat" DOUBLE PRECISION,
    "geoLng" DOUBLE PRECISION,
    "geoAccuracy" DOUBLE PRECISION,
    "geoTimestamp" TIMESTAMP(3),
    "customFieldValues" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditPhoto" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "geoLat" DOUBLE PRECISION,
    "geoLng" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportComment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "itemId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locationScope" TEXT,
    "departmentScope" TEXT[],
    "allDepartments" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB NOT NULL DEFAULT '{"canView": true, "canFlag": false, "canRemark": false, "canApprove": false, "canReject": false}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "importedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" "SyncPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SyncQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_appType_idx" ON "User"("appType");

-- CreateIndex
CREATE INDEX "User_assignedLocationId_idx" ON "User"("assignedLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "Location_path_idx" ON "Location"("path");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- CreateIndex
CREATE INDEX "Location_code_idx" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Location_parentId_code_key" ON "Location"("parentId", "code");

-- CreateIndex
CREATE INDEX "LocationSchedule_scheduledDate_idx" ON "LocationSchedule"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "LocationSchedule_locationId_scheduledDate_key" ON "LocationSchedule"("locationId", "scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_code_key" ON "AssetCategory"("code");

-- CreateIndex
CREATE INDEX "AssetCategory_code_idx" ON "AssetCategory"("code");

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_categoryId_idx" ON "CustomFieldDefinition"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_code_key" ON "InventoryItem"("code");

-- CreateIndex
CREATE INDEX "InventoryItem_locationId_idx" ON "InventoryItem"("locationId");

-- CreateIndex
CREATE INDEX "InventoryItem_departmentId_idx" ON "InventoryItem"("departmentId");

-- CreateIndex
CREATE INDEX "InventoryItem_code_idx" ON "InventoryItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodeTag_code_key" ON "QRCodeTag"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodeTag_linkedItemId_key" ON "QRCodeTag"("linkedItemId");

-- CreateIndex
CREATE INDEX "QRCodeTag_code_idx" ON "QRCodeTag"("code");

-- CreateIndex
CREATE INDEX "QRCodeTag_status_idx" ON "QRCodeTag"("status");

-- CreateIndex
CREATE INDEX "QRCodeTag_batchId_idx" ON "QRCodeTag"("batchId");

-- CreateIndex
CREATE INDEX "AuditReport_locationId_idx" ON "AuditReport"("locationId");

-- CreateIndex
CREATE INDEX "AuditReport_auditorId_idx" ON "AuditReport"("auditorId");

-- CreateIndex
CREATE INDEX "AuditReport_status_idx" ON "AuditReport"("status");

-- CreateIndex
CREATE INDEX "AuditFinding_reportId_idx" ON "AuditFinding"("reportId");

-- CreateIndex
CREATE INDEX "AuditFinding_itemId_idx" ON "AuditFinding"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditFinding_reportId_itemId_key" ON "AuditFinding"("reportId", "itemId");

-- CreateIndex
CREATE INDEX "AuditPhoto_findingId_idx" ON "AuditPhoto"("findingId");

-- CreateIndex
CREATE INDEX "ReportComment_reportId_idx" ON "ReportComment"("reportId");

-- CreateIndex
CREATE INDEX "ReportComment_itemId_idx" ON "ReportComment"("itemId");

-- CreateIndex
CREATE INDEX "ClientRole_name_idx" ON "ClientRole"("name");

-- CreateIndex
CREATE INDEX "ImportLog_importedBy_idx" ON "ImportLog"("importedBy");

-- CreateIndex
CREATE INDEX "ImportLog_createdAt_idx" ON "ImportLog"("createdAt");

-- CreateIndex
CREATE INDEX "SyncQueue_userId_idx" ON "SyncQueue"("userId");

-- CreateIndex
CREATE INDEX "SyncQueue_status_idx" ON "SyncQueue"("status");

-- CreateIndex
CREATE INDEX "SyncQueue_priority_idx" ON "SyncQueue"("priority");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedLocationId_fkey" FOREIGN KEY ("assignedLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientRoleId_fkey" FOREIGN KEY ("clientRoleId") REFERENCES "ClientRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationSchedule" ADD CONSTRAINT "LocationSchedule_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldDefinition" ADD CONSTRAINT "CustomFieldDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeTag" ADD CONSTRAINT "QRCodeTag_linkedItemId_fkey" FOREIGN KEY ("linkedItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AuditReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPhoto" ADD CONSTRAINT "AuditPhoto_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "AuditFinding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportComment" ADD CONSTRAINT "ReportComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AuditReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportComment" ADD CONSTRAINT "ReportComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncQueue" ADD CONSTRAINT "SyncQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
