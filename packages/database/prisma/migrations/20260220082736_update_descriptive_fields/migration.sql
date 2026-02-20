/*
  Warnings:

  - You are about to drop the column `bookValue` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assetNumber]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locationCode]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assetName` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetNumber` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationCode` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationName` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AppType" ADD VALUE 'WEB';

-- DropIndex
DROP INDEX "InventoryItem_code_idx";

-- DropIndex
DROP INDEX "InventoryItem_code_key";

-- DropIndex
DROP INDEX "Location_code_idx";

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "bookValue",
DROP COLUMN "code",
DROP COLUMN "cost",
DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "purchaseDate",
ADD COLUMN     "accumulatedDepreciation" DECIMAL(15,2),
ADD COLUMN     "acquisitionCost" DECIMAL(15,2),
ADD COLUMN     "assetDescription" TEXT,
ADD COLUMN     "assetName" TEXT NOT NULL,
ADD COLUMN     "assetNumber" TEXT NOT NULL,
ADD COLUMN     "capitalizationDate" TIMESTAMP(3),
ADD COLUMN     "inventoryStatus" TEXT,
ADD COLUMN     "netBookValue" DECIMAL(15,2),
ADD COLUMN     "quantityAsPerBooks" INTEGER;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "code",
DROP COLUMN "name",
ADD COLUMN     "locationCode" TEXT NOT NULL,
ADD COLUMN     "locationName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "HierarchyConfig" (
    "level" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HierarchyConfig_pkey" PRIMARY KEY ("level")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_assetNumber_key" ON "InventoryItem"("assetNumber");

-- CreateIndex
CREATE INDEX "InventoryItem_assetNumber_idx" ON "InventoryItem"("assetNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationCode_key" ON "Location"("locationCode");

-- CreateIndex
CREATE INDEX "Location_locationCode_idx" ON "Location"("locationCode");
