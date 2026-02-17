-- DropIndex
DROP INDEX "Location_parentId_code_key";

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "bookValue" DECIMAL(15,2),
ADD COLUMN     "cost" DECIMAL(15,2),
ADD COLUMN     "profitCenter" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "unitOfMeasure" TEXT;
