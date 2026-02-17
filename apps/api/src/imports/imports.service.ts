import { PrismaService } from "@assetsally/database";
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import * as xlsx from "xlsx";

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async wipeData() {
    try {
      // Transaction to ensure data integrity
      await this.prisma.$transaction([
        this.prisma.inventoryItem.deleteMany(),
        this.prisma.location.deleteMany(),
      ]);
      return {
        message:
          "All locations and inventory items have been wiped successfully.",
      };
    } catch (error) {
      console.error("Error wiping data:", error);
      throw new InternalServerErrorException("Failed to wipe data");
    }
  }

  async processImport(
    file: Express.Multer.File,
    type: "locations" | "inventory",
  ) {
    // Basic validation of file type
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      throw new BadRequestException("File is empty");
    }

    if (type === "locations") {
      return this.importLocations(data);
    } else if (type === "inventory") {
      return this.importInventory(data);
    }
  }

  private async importLocations(data: any[]) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Sort by code length to approximate hierarchy (shorter codes are likely parents of longer codes)
    const sortedData = data.sort((a, b) => {
      const codeA = String(a["Code"] || a["code"] || "").length;
      const codeB = String(b["Code"] || b["code"] || "").length;
      return codeA - codeB;
    });

    for (const row of sortedData) {
      try {
        const code = String(row["Code"] || row["code"] || "").trim();
        const name = String(row["Name"] || row["name"] || "").trim();
        const type = String(row["Type"] || row["type"] || "Location").trim();
        const parentCode = String(
          row["Parent Code"] || row["parent_code"] || "",
        ).trim();

        if (!code || !name) {
          errorCount++;
          errors.push({ row, error: "Missing Code or Name" });
          continue;
        }

        let parentId = null;
        let path = code;
        let depth = 0;

        if (parentCode) {
          const parent = await this.prisma.location.findFirst({
            where: { code: parentCode },
          });
          if (parent) {
            parentId = parent.id;
            path = `${parent.path}.${code}`;
            depth = parent.depth + 1;
          } else {
            errorCount++;
            errors.push({
              row,
              error: `Parent location with code ${parentCode} not found`,
            });
            continue;
          }
        }

        await this.prisma.location.upsert({
          where: { code },
          update: {
            name,
            levelLabel: type,
            path,
            depth,
            parentId,
          },
          create: {
            code,
            name,
            levelLabel: type,
            path,
            depth,
            parentId,
          },
        });
        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({ row, error: error.message });
      }
    }

    return {
      message: "Locations import completed",
      successCount,
      errorCount,
      errors,
    };
  }

  private async importInventory(data: any[]) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const row of data) {
      try {
        const code = String(
          row["Asset ID"] || row["Asset Code"] || row["code"] || "",
        ).trim();
        const name = String(row["Description"] || row["name"] || "").trim();
        const locationCode = String(
          row["Location Code"] || row["location_code"] || "",
        ).trim();
        const departmentCode = String(
          row["Department Code"] || row["department_code"] || "",
        ).trim();
        const categoryCode = String(
          row["Category Code"] || row["category_code"] || "",
        ).trim();

        // Extended attributes
        const subCategory = row["Sub Category"] || row["sub_category"];
        const profitCenter = row["Profit Center"] || row["profit_center"];
        const cost = row["Acquisition Cost"] || row["cost"];
        const bookValue = row["Net Book Value"] || row["book_value"];
        const purchaseDateRaw = row["Capitalized Date"] || row["purchase_date"];
        const unitOfMeasure = row["UOM"] || row["unit_of_measure"];

        if (!code) {
          errorCount++;
          errors.push({ row, error: "Missing Asset ID/Code" });
          continue;
        }

        // Resolve Location
        let locationId: string;
        if (locationCode) {
          const loc = await this.prisma.location.findFirst({
            where: { code: locationCode },
          });
          if (!loc) {
            errorCount++;
            errors.push({ row, error: `Location ${locationCode} not found` });
            continue;
          }
          locationId = loc.id;
        } else {
          errorCount++;
          errors.push({ row, error: "Missing Location Code" });
          continue;
        }

        // Resolve Department (Optional - Create if not exists or find)
        let departmentId = null;
        if (departmentCode) {
          let dept = await this.prisma.department.findUnique({
            where: { code: departmentCode },
          });
          if (!dept) {
            const deptName = String(
              row["Department"] || row["Department Name"] || departmentCode,
            ).trim();
            dept = await this.prisma.department.create({
              data: { code: departmentCode, name: deptName },
            });
          }
          departmentId = dept.id;
        }

        // Resolve Category (Optional)
        let categoryId = null;
        if (categoryCode) {
          let cat = await this.prisma.assetCategory.findUnique({
            where: { code: categoryCode },
          });
          if (!cat) {
            const catName = String(
              row["Asset Category"] || row["Category Name"] || categoryCode,
            ).trim();
            cat = await this.prisma.assetCategory.create({
              data: { code: categoryCode, name: catName },
            });
          }
          categoryId = cat.id;
        }

        // Parse date
        let purchaseDate: Date | null = null;
        if (purchaseDateRaw) {
          if (typeof purchaseDateRaw === "number") {
            purchaseDate = new Date(
              Math.round((purchaseDateRaw - 25569) * 86400 * 1000),
            );
          } else {
            purchaseDate = new Date(purchaseDateRaw);
          }
          if (isNaN(purchaseDate.getTime())) purchaseDate = null;
        }

        await this.prisma.inventoryItem.upsert({
          where: { code },
          update: {
            name: name || "Unknown Asset",
            locationId,
            departmentId,
            categoryId,
            subCategory: subCategory ? String(subCategory) : null,
            profitCenter: profitCenter ? String(profitCenter) : null,
            cost: cost ? Number(cost) : null,
            bookValue: bookValue ? Number(bookValue) : null,
            purchaseDate,
            unitOfMeasure: unitOfMeasure ? String(unitOfMeasure) : null,
            description: String(row["Description 2"] || ""),
          },
          create: {
            code,
            name: name || "Unknown Asset",
            locationId,
            departmentId,
            categoryId,
            subCategory: subCategory ? String(subCategory) : null,
            profitCenter: profitCenter ? String(profitCenter) : null,
            cost: cost ? Number(cost) : null,
            bookValue: bookValue ? Number(bookValue) : null,
            purchaseDate,
            unitOfMeasure: unitOfMeasure ? String(unitOfMeasure) : null,
            description: String(row["Description 2"] || ""),
          },
        });
        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({ row, error: error.message });
      }
    }

    return {
      message: "Inventory import completed",
      successCount,
      errorCount,
      errors,
    };
  }
}
