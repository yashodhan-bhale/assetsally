import { Module } from "@nestjs/common";

import { InventoryModule } from "../inventory/inventory.module";
import { LocationsModule } from "../locations/locations.module";
import { PrismaModule } from "../prisma/prisma.module";

import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";

@Module({
  imports: [PrismaModule, LocationsModule, InventoryModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
