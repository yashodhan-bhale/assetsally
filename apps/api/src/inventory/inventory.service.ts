import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as XLSX from "xlsx";

import { PrismaService } from "../prisma/prisma.service";

import { CreateInventoryItemDto, UpdateInventoryItemDto } from "./dto";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    locationId?: string;
    departmentId?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.locationId) where.locationId = query.locationId;
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.search) {
      where.OR = [
        { assetName: { contains: query.search, mode: "insensitive" } },
        { assetNumber: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              locationCode: true,
              locationName: true,
              path: true,
            },
          },
          department: { select: { id: true, code: true, name: true } },
          category: { select: { id: true, code: true, name: true } },
          QRBindingRecord: {
            select: {
              qrTag: { select: { id: true, code: true, status: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { assetNumber: "asc" },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        location: true,
        department: true,
        category: true,
        QRBindingRecord: {
          include: {
            qrTag: true,
          },
        },
        auditFindings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            report: { select: { id: true, status: true, createdAt: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async create(dto: CreateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { assetNumber: dto.assetNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Item with code ${dto.assetNumber} already exists`,
      );
    }

    return this.prisma.inventoryItem.create({
      data: {
        assetNumber: dto.assetNumber,
        assetName: dto.assetName,
        assetDescription: dto.assetDescription,
        locationId: dto.locationId,
        departmentId: dto.departmentId,
        categoryId: dto.categoryId,
        customFields: dto.customFields || {},
        capitalizationDate: dto.capitalizationDate
          ? new Date(dto.capitalizationDate)
          : undefined,
        acquisitionCost: dto.acquisitionCost,
        netBookValue: dto.netBookValue,
        accumulatedDepreciation: dto.accumulatedDepreciation,
        quantityAsPerBooks: dto.quantityAsPerBooks,
        quantityAsPerPhysical: dto.quantityAsPerPhysical,
        quantityDifference: dto.quantityDifference,
        biometricTag: dto.biometricTag,
        importRemarks: dto.importRemarks,
        inventoryStatus: dto.inventoryStatus,
        profitCenter: dto.profitCenter,
        subCategory: dto.subCategory,
        unitOfMeasure: dto.unitOfMeasure,
      },
      include: {
        location: {
          select: { id: true, locationCode: true, locationName: true },
        },
        department: { select: { id: true, code: true, name: true } },
        category: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...dto,
        capitalizationDate: dto.capitalizationDate
          ? new Date(dto.capitalizationDate)
          : undefined,
      },
      include: {
        location: {
          select: { id: true, locationCode: true, locationName: true },
        },
        department: { select: { id: true, code: true, name: true } },
        category: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async bulkImport(fileBuffer: Buffer, filename: string) {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName =
      workbook.SheetNames.find((n) => n.trim() === "Inventory Report") ||
      workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any>(worksheet);

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Pre-fetch caches (optimization)
    const departments = await this.prisma.department.findMany();
    const deptMap = new Map(
      departments.map((d) => [d.name.toLowerCase().trim(), d.id]),
    );

    const categories = await this.prisma.assetCategory.findMany();
    const catMap = new Map(
      categories.map((c) => [c.name.toLowerCase().trim(), c.id]),
    );

    const locations = await this.prisma.location.findMany({
      select: { id: true, locationCode: true },
    });
    const locMap = new Map(
      locations.map((l) => [l.locationCode.toLowerCase().trim(), l.id]),
    );

    for (const [index, row] of data.entries()) {
      const rowIndex = index + 2; // Excel row number (1-based, +1 for header)
      try {
        // Headers from the new format
        const code = row["Asset Number"];
        const name = row["Name of the Assets"];
        const locCode = row["Storage Location Code"];

        if (!code || !name) {
          continue;
        }

        results.processed++;

        // 1. Resolve Location (Mandatory)
        const locationId = locMap.get(
          String(locCode || "")
            .toLowerCase()
            .trim(),
        );
        if (!locationId) {
          results.errors.push(
            `Row ${rowIndex}: Location code '${locCode}' not found`,
          );
          continue;
        }

        // 2. Resolve Department (Optional)
        let departmentId: string | null = null;
        const deptName = row["Department"];
        if (deptName) {
          const normDept = String(deptName).toLowerCase().trim();
          if (deptMap.has(normDept)) {
            departmentId = deptMap.get(normDept)!;
          } else {
            const newDept = await this.prisma.department.create({
              data: {
                code: (
                  deptName
                    .substring(0, 6)
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "") +
                  "-" +
                  Math.random().toString(36).substring(2, 6).toUpperCase()
                ).substring(0, 20),
                name: deptName,
              },
            });
            departmentId = newDept.id;
            deptMap.set(normDept, newDept.id);
          }
        }

        // 3. Resolve Category (Optional)
        let categoryId: string | null = null;
        const catName = row["Major Catogeory"];
        if (catName) {
          const normCat = String(catName).toLowerCase().trim();
          if (catMap.has(normCat)) {
            categoryId = catMap.get(normCat)!;
          } else {
            const newCat = await this.prisma.assetCategory.create({
              data: {
                code: (
                  catName
                    .substring(0, 6)
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "") +
                  "-" +
                  Math.random().toString(36).substring(2, 6).toUpperCase()
                ).substring(0, 20),
                name: catName,
              },
            });
            categoryId = newCat.id;
            catMap.set(normCat, newCat.id);
          }
        }

        // 4. Map Dates & Financials
        const dateRaw = row["Date of Put to use of asset"];
        let capitalizationDate: Date | undefined;
        if (typeof dateRaw === "number") {
          capitalizationDate = new Date(
            Math.round((dateRaw - 25569) * 86400 * 1000),
          );
        } else if (dateRaw) {
          capitalizationDate = new Date(dateRaw);
        }

        const acquisitionCost =
          parseFloat(
            String(row["Cost of Asset"] || "0").replace(/[^0-9.-]/g, ""),
          ) || undefined;
        const netBookValue =
          parseFloat(
            String(row["Book Value"] || "0").replace(/[^0-9.-]/g, ""),
          ) || undefined;
        const accumulatedDepreciation =
          parseFloat(
            String(row["Accumulated Deprication"] || "0").replace(
              /[^0-9.-]/g,
              "",
            ),
          ) || undefined;
        const quantityAsPerBooks = parseInt(row["As per Books"]) || undefined;
        const quantityAsPerPhysical =
          parseInt(row["As per Physical Verification"]) || undefined;
        const quantityDifference = parseInt(row["Difference"]) || undefined;
        const biometricTag = row["Bimatric Tag"]
          ? String(row["Bimatric Tag"])
          : undefined;
        const importRemarks = row["Remark"] ? String(row["Remark"]) : undefined;
        const inventoryStatus = row["Status"]
          ? String(row["Status"])
          : undefined;
        const profitCenter = row["Profit Center"]
          ? String(row["Profit Center"])
          : undefined;
        const subCategory = row["Minor Catogeory"];
        const uom = row["A"];
        const assetDescription = row["Descrption of Asset"];

        // 5. Upsert Item
        const itemData = {
          assetNumber: String(code),
          assetName: String(name),
          assetDescription: assetDescription
            ? String(assetDescription)
            : undefined,
          locationId,
          departmentId,
          categoryId,
          acquisitionCost,
          netBookValue,
          accumulatedDepreciation,
          quantityAsPerBooks,
          quantityAsPerPhysical,
          quantityDifference,
          biometricTag,
          importRemarks,
          inventoryStatus,
          capitalizationDate,
          profitCenter,
          subCategory: subCategory ? String(subCategory) : undefined,
          unitOfMeasure: uom ? String(uom) : undefined,
          customFields: {},
        };

        const existingItem = await this.prisma.inventoryItem.findUnique({
          where: { assetNumber: String(code) },
        });

        if (existingItem) {
          await this.prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: itemData,
          });
          results.updated++;
        } else {
          await this.prisma.inventoryItem.create({
            data: itemData,
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Row ${rowIndex}: ${error.message}`);
      }
    }

    return results;
  }

  async getStats() {
    const [totalItems, itemsByLocation, itemsByCategory] = await Promise.all([
      this.prisma.inventoryItem.count(),
      this.prisma.inventoryItem.groupBy({
        by: ["locationId"],
        _count: true,
      }),
      this.prisma.inventoryItem.groupBy({
        by: ["categoryId"],
        _count: true,
      }),
    ]);

    return { totalItems, itemsByLocation, itemsByCategory };
  }
}
