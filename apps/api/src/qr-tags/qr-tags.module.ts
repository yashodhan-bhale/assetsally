import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { QrGenerationProcessor } from "./qr-generation.processor";
import { QrTagsController } from "./qr-tags.controller";
import { QrTagsService } from "./qr-tags.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [QrTagsController],
  providers: [QrTagsService, QrGenerationProcessor],
  exports: [QrTagsService],
})
export class QrTagsModule {}
