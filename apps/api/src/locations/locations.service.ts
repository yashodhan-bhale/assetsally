import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as XLSX from "xlsx";

import { PrismaService } from "../prisma/prisma.service";

import { CreateLocationDto, UpdateLocationDto } from "./dto";

const MAX_DEPTH = 4; // Levels 0..3 (L1 = depth 0, L4 = depth 3)

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { parentId?: string; depth?: number }) {
    const where: any = {};
    if (query?.parentId) where.parentId = query.parentId;
    if (query?.depth !== undefined) where.depth = query.depth;

    return this.prisma.location.findMany({
      where,
      include: {
        children: {
          select: {
            id: true,
            locationCode: true,
            locationName: true,
            depth: true,
          },
        },
        _count: { select: { inventoryItems: true } },
      },
      orderBy: { path: "asc" },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, locationCode: true, locationName: true },
        },
        children: {
          select: {
            id: true,
            locationCode: true,
            locationName: true,
            depth: true,
            levelLabel: true,
          },
        },
        _count: { select: { inventoryItems: true, auditReports: true } },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location ${id} not found`);
    }

    return location;
  }

  async findTree() {
    return this.prisma.location.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                // Removed 5th level child inclusion as depth is now 4
              },
            },
          },
        },
      },
      orderBy: { locationName: "asc" },
    });
  }

  async create(dto: CreateLocationDto) {
    // Validate max depth
    if (dto.depth >= MAX_DEPTH) {
      throw new BadRequestException(
        `Maximum hierarchy depth is ${MAX_DEPTH} levels (0-${MAX_DEPTH - 1}). Received depth: ${dto.depth}`,
      );
    }

    // Validate parent exists and depth is consistent
    if (dto.parentId) {
      const parent = await this.prisma.location.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent location ${dto.parentId} not found`,
        );
      }
      if (dto.depth !== parent.depth + 1) {
        throw new BadRequestException(
          `Depth must be parent depth + 1. Parent depth: ${parent.depth}, expected: ${parent.depth + 1}, received: ${dto.depth}`,
        );
      }
    } else if (dto.depth !== 0) {
      throw new BadRequestException("Root locations must have depth 0");
    }

    // Check for duplicate code (globally unique)
    const existing = await this.prisma.location.findFirst({
      where: { locationCode: dto.locationCode },
    });
    if (existing) {
      throw new ConflictException(
        `Location with code ${dto.locationCode} already exists`,
      );
    }

    return this.prisma.location.create({
      data: {
        locationCode: dto.locationCode,
        locationName: dto.locationName,
        description: dto.description,
        path: dto.path,
        depth: dto.depth,
        levelLabel: dto.levelLabel,
        parentId: dto.parentId,
      },
    });
  }

  async update(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);

    return this.prisma.location.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const location = await this.findOne(id);

    if ((location as any).children?.length > 0) {
      throw new ConflictException(
        "Cannot delete location with child locations",
      );
    }

    return this.prisma.location.delete({ where: { id } });
  }

  // =========================================================================
  // Bulk Import (Excel/CSV)
  // =========================================================================

  /**
   * Imports locations from an Excel/CSV file with columns:
   * L1 Code | L1 Name | L2 Code | L2 Name | ... | L4 Code | L4 Name
   *
   * Processing:
   * - Rows processed top-down, left-to-right
   * - Deduplication: existing nodes are reused by code
   * - Idempotent: re-import updates names but preserves IDs
   * - Auto-computes path and depth
   */
  async bulkImport(
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    const rows = this.parseFile(fileBuffer, originalName);

    if (rows.length === 0) {
      throw new BadRequestException("File contains no data rows");
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Level labels default to Level 1..Level 4
    const levelLabels = ["Level 1", "Level 2", "Level 3", "Level 4"];

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const rowNum = rowIdx + 2; // +2 for 1-indexed + header row

      try {
        let parentId: string | null = null;
        const pathParts: string[] = [];

        for (let level = 0; level < MAX_DEPTH; level++) {
          const code = this.cleanCell(
            row[`L${level + 1} Code`] ||
              row[`l${level + 1}_code`] ||
              row[`L${level + 1}Code`],
          );
          const name = this.cleanCell(
            row[`L${level + 1} Name`] ||
              row[`l${level + 1}_name`] ||
              row[`L${level + 1}Name`],
          );

          // If both code and name are empty, this level and beyond are empty (ragged tree)
          if (!code && !name) break;

          if (!code || !name) {
            errors.push(
              `Row ${rowNum}: Level ${level + 1} has code but no name (or vice versa)`,
            );
            break;
          }

          pathParts.push(code);
          const path = pathParts.join(".");

          // Check if this location already exists
          const existing = await this.prisma.location.findFirst({
            where: { locationCode: code },
          });

          if (existing) {
            // Update name if changed (idempotent re-import)
            if (existing.locationName !== name) {
              await this.prisma.location.update({
                where: { id: existing.id },
                data: { locationName: name, path, depth: level, parentId },
              });
              updated++;
            } else {
              skipped++;
            }
            parentId = existing.id;
          } else {
            // Create new location
            const newLoc: { id: string } = await this.prisma.location.create({
              data: {
                locationCode: code,
                locationName: name,
                path,
                depth: level,
                levelLabel: levelLabels[level],
                parentId,
              },
            });
            parentId = newLoc.id;
            created++;
          }
        }
      } catch (err: any) {
        errors.push(`Row ${rowNum}: ${err.message}`);
      }
    }

    return { created, updated, skipped, errors };
  }

  private parseFile(
    buffer: Buffer,
    filename: string,
  ): Record<string, string>[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException("File contains no sheets");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    // Validate that we have at least L1 columns
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const hasL1 = headers.some(
        (h) => /l1[\s_]?code/i.test(h) || h === "L1 Code" || h === "L1Code",
      );
      if (!hasL1) {
        throw new BadRequestException(
          'File must have columns: "L1 Code", "L1 Name", "L2 Code", "L2 Name", etc. ' +
            `Found headers: ${headers.join(", ")}`,
        );
      }
    }

    return rows;
  }

  private cleanCell(value: any): string {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  // =========================================================================
  // Cascading Authorization (Subtree Queries)
  // =========================================================================

  /**
   * Returns all location IDs in the subtree rooted at the given location.
   * Uses materialized path for efficient lookup (no recursive queries).
   *
   * Usage: Get all locations a user has access to based on their assignment.
   */
  async getSubtreeIds(locationId: string): Promise<string[]> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, path: true },
    });

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found`);
    }

    // Use materialized path: find all locations whose path starts with this one
    const subtree = await this.prisma.location.findMany({
      where: {
        OR: [
          { id: locationId }, // The node itself
          { path: { startsWith: `${location.path}.` } }, // All descendants
        ],
      },
      select: { id: true },
    });

    return subtree.map((l) => l.id);
  }

  /**
   * Returns all location IDs a user has access to based on their assignment.
   * If no assignment, returns all location IDs (admin/unrestricted access).
   */
  async getUserAccessibleLocationIds(userId: string): Promise<string[] | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { assignedLocationId: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Admins and super admins have unrestricted access
    if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return null; // null = no restriction
    }

    // If user has no location assignment, they see nothing
    if (!user.assignedLocationId) {
      return [];
    }

    // Return the subtree IDs for the assigned location
    return this.getSubtreeIds(user.assignedLocationId);
  }
}
