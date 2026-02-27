import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

import { InventoryService } from "../inventory/inventory.service";
import { LocationsService } from "../locations/locations.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ImportsService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
    private inventoryService: InventoryService,
  ) {}

  async wipeData() {
    try {
      // Transaction to ensure data integrity
      await this.prisma.$transaction([
        this.prisma.inventoryItem.deleteMany(),
        this.prisma.location.deleteMany(),
        this.prisma.department.deleteMany(),
        this.prisma.assetCategory.deleteMany(),
      ]);
      return {
        message:
          "All locations, inventory items, departments, and categories have been wiped successfully.",
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
    if (type === "locations") {
      return this.locationsService.bulkImport(file.buffer, file.originalname);
    } else if (type === "inventory") {
      return this.inventoryService.bulkImport(file.buffer, file.originalname);
    }

    throw new BadRequestException("Invalid import type");
  }
}
