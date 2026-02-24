import { Module } from "@nestjs/common";

import { AuditScheduleController } from "./audit-schedule.controller";
import { AuditScheduleService } from "./audit-schedule.service";

@Module({
  controllers: [AuditScheduleController],
  providers: [AuditScheduleService],
})
export class AuditScheduleModule {}
