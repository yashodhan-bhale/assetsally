import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";

import { AuditScheduleService } from "./audit-schedule.service";
import { CreateAuditScheduleDto } from "./dto/create-audit-schedule.dto";
import { UpdateAuditScheduleDto } from "./dto/update-audit-schedule.dto";

@Controller("audit-schedule")
export class AuditScheduleController {
  constructor(private readonly auditScheduleService: AuditScheduleService) {}

  @Get("summary")
  getSummary() {
    return this.auditScheduleService.getSummary();
  }

  @Get("calendar")
  getCalendar() {
    return this.auditScheduleService.getCalendar();
  }

  @Get("auditors")
  getAuditors() {
    return this.auditScheduleService.getAuditors();
  }

  @Get("locations")
  getLocations() {
    return this.auditScheduleService.getLocations();
  }

  @Post()
  create(@Body() createAuditScheduleDto: CreateAuditScheduleDto) {
    return this.auditScheduleService.create(createAuditScheduleDto);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateAuditScheduleDto: UpdateAuditScheduleDto,
  ) {
    return this.auditScheduleService.update(id, updateAuditScheduleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.auditScheduleService.remove(id);
  }

  @Delete("location/:locationId")
  removeByLocation(@Param("locationId") locationId: string) {
    return this.auditScheduleService.removeByLocation(locationId);
  }
}
