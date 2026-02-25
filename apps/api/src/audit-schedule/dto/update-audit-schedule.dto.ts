import { PartialType } from "@nestjs/swagger";

import { CreateAuditScheduleDto } from "./create-audit-schedule.dto";

export class UpdateAuditScheduleDto extends PartialType(
  CreateAuditScheduleDto,
) {}
