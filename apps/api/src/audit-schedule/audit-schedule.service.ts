import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateAuditScheduleDto } from "./dto/create-audit-schedule.dto";
import { UpdateAuditScheduleDto } from "./dto/update-audit-schedule.dto";

@Injectable()
export class AuditScheduleService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const totalLocations = await this.prisma.location.count();

    // Locations without any schedules
    const unscheduledLocations = await this.prisma.location.count({
      where: { schedules: { none: {} } },
    });

    // Locations with schedules but no auditors assigned
    const unassignedLocations = await this.prisma.location.count({
      where: {
        schedules: { some: {} },
        AND: {
          schedules: { none: { assignedAuditors: { some: {} } } },
        },
      },
    });

    const totalAuditors = await this.prisma.user.count({
      where: { role: "AUDITOR", status: "ACTIVE" },
    });

    // Auditors unused (no assignments on or after today)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const unusedAuditors = await this.prisma.user.count({
      where: {
        role: "AUDITOR",
        status: "ACTIVE",
        schedules: { none: { scheduledDate: { gte: today } } },
      },
    });

    return {
      locations: {
        total: totalLocations,
        unassigned: unassignedLocations,
        unscheduled: unscheduledLocations,
      },
      auditors: {
        total: totalAuditors,
        unused: unusedAuditors,
      },
    };
  }

  async getCalendar() {
    return this.prisma.locationSchedule.findMany({
      include: {
        location: {
          select: { id: true, locationName: true, locationCode: true },
        },
        assignedAuditors: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getAuditors() {
    return this.prisma.user.findMany({
      where: { role: "AUDITOR" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        schedules: {
          where: { scheduledDate: { gte: new Date() } },
          include: { location: { select: { id: true, locationName: true } } },
        },
      },
    });
  }

  async getLocations() {
    return this.prisma.location.findMany({
      include: {
        schedules: {
          include: {
            assignedAuditors: { select: { id: true, name: true, email: true } },
          },
          orderBy: { scheduledDate: "desc" },
        },
      },
      orderBy: { locationName: "asc" },
    });
  }

  async create(dto: CreateAuditScheduleDto) {
    const scheduleDate = new Date(dto.scheduledDate);
    const startOfDay = new Date(scheduleDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduleDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Ensure location does not already have a schedule on the same date
    const existingSchedule = await this.prisma.locationSchedule.findFirst({
      where: {
        locationId: dto.locationId,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        "Location is already scheduled for this date.",
      );
    }

    // Daily Limit: Ensure no auditor is assigned to another location on the same date
    if (dto.assignedAuditorIds && dto.assignedAuditorIds.length > 0) {
      const concurrentAssignments = await this.prisma.locationSchedule.findMany(
        {
          where: {
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            locationId: { not: dto.locationId },
            assignedAuditors: { some: { id: { in: dto.assignedAuditorIds } } },
          },
          include: { assignedAuditors: true },
        },
      );

      if (concurrentAssignments.length > 0) {
        throw new BadRequestException(
          "One or more auditors are already assigned to a different location on this date.",
        );
      }
    }

    return this.prisma.locationSchedule.create({
      data: {
        locationId: dto.locationId,
        scheduledDate: scheduleDate,
        isOverrideLocked: dto.isOverrideLocked || false,
        notes: dto.notes,
        assignedAuditors: {
          connect: dto.assignedAuditorIds?.map((id) => ({ id })) || [],
        },
      },
      include: { assignedAuditors: true, location: true },
    });
  }

  async update(id: string, dto: UpdateAuditScheduleDto) {
    const schedule = await this.prisma.locationSchedule.findUnique({
      where: { id },
    });
    if (!schedule) throw new NotFoundException("Schedule not found");

    const newDate = dto.scheduledDate
      ? new Date(dto.scheduledDate)
      : schedule.scheduledDate;
    const auditorIds =
      dto.assignedAuditorIds !== undefined ? dto.assignedAuditorIds : undefined;

    const startOfDay = new Date(newDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(newDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (auditorIds && auditorIds.length > 0) {
      const concurrentAssignments = await this.prisma.locationSchedule.findMany(
        {
          where: {
            id: { not: id },
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            locationId: { not: dto.locationId || schedule.locationId },
            assignedAuditors: { some: { id: { in: auditorIds } } },
          },
        },
      );

      if (concurrentAssignments.length > 0) {
        throw new BadRequestException(
          "One or more auditors are already assigned to a different location on this date.",
        );
      }
    }

    return this.prisma.locationSchedule.update({
      where: { id },
      data: {
        scheduledDate: dto.scheduledDate ? newDate : undefined,
        isOverrideLocked: dto.isOverrideLocked,
        notes: dto.notes,
        assignedAuditors: auditorIds
          ? {
              set: auditorIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: { assignedAuditors: true, location: true },
    });
  }

  async remove(id: string) {
    return this.prisma.locationSchedule.delete({ where: { id } });
  }

  async removeByLocation(locationId: string) {
    return this.prisma.locationSchedule.deleteMany({
      where: { locationId },
    });
  }
}
