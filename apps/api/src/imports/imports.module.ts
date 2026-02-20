import { DatabaseModule } from "@assetsally/database";
import { Module } from "@nestjs/common";

import { InventoryModule } from "../inventory/inventory.module";
import { LocationsModule } from "../locations/locations.module";

import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";

@Module({
  imports: [DatabaseModule, LocationsModule, InventoryModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
