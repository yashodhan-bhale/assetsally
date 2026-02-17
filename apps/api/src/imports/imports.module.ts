import { DatabaseModule } from "@assetsally/database";
import { Module } from "@nestjs/common";

import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
