import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import {
  VerificationStatus,
  ItemCondition,
  AuditReportStatus,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateAuditReportDto, SubmitFindingDto, ReviewReportDto } from "./dto";

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    locationId?: string;
    auditorId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.locationId) where.locationId = query.locationId;
    if (query?.auditorId) where.auditorId = query.auditorId;
    if (query?.status) where.status = query.status;

    const [reports, total] = await Promise.all([
      this.prisma.auditReport.findMany({
        where,
        include: {
          location: {
            select: { id: true, locationCode: true, locationName: true },
          },
          auditor: { select: { id: true, name: true, email: true } },
          _count: { select: { findings: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.auditReport.count({ where }),
    ]);

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.auditReport.findUnique({
      where: { id },
      include: {
        location: true,
        auditor: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        findings: {
          include: {
            item: { select: { id: true, assetNumber: true, assetName: true } },
            photos: true,
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Audit report ${id} not found`);
    }

    return report;
  }

  async create(dto: CreateAuditReportDto, auditorId: string) {
    return this.prisma.auditReport.create({
      data: {
        locationId: dto.locationId,
        auditorId,
        status: AuditReportStatus.DRAFT,
      },
      include: {
        location: {
          select: { id: true, locationCode: true, locationName: true },
        },
      },
    });
  }

  async submitFinding(
    reportId: string,
    dto: SubmitFindingDto,
    auditorId: string,
  ) {
    const report = await this.prisma.auditReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException("Report not found");
    if (report.auditorId !== auditorId)
      throw new ForbiddenException("Not your report");
    if (report.status !== AuditReportStatus.DRAFT)
      throw new BadRequestException("Report already submitted");

    return this.prisma.auditFinding.upsert({
      where: { reportId_itemId: { reportId, itemId: dto.itemId } },
      update: {
        status: dto.status as VerificationStatus,
        condition: dto.condition as ItemCondition | undefined,
        notes: dto.notes,
        geoLat: dto.geoLat,
        geoLng: dto.geoLng,
        geoAccuracy: dto.geoAccuracy,
        customFieldValues: dto.customFieldValues || {},
      },
      create: {
        reportId,
        itemId: dto.itemId,
        status: dto.status as VerificationStatus,
        condition: dto.condition as ItemCondition | undefined,
        notes: dto.notes,
        geoLat: dto.geoLat,
        geoLng: dto.geoLng,
        geoAccuracy: dto.geoAccuracy,
        customFieldValues: dto.customFieldValues || {},
      },
      include: {
        item: { select: { id: true, assetNumber: true, assetName: true } },
      },
    });
  }

  async submitReport(reportId: string, auditorId: string) {
    const report = await this.prisma.auditReport.findUnique({
      where: { id: reportId },
      include: { _count: { select: { findings: true } } },
    });

    if (!report) throw new NotFoundException("Report not found");
    if (report.auditorId !== auditorId)
      throw new ForbiddenException("Not your report");
    if (report.status !== AuditReportStatus.DRAFT)
      throw new BadRequestException("Report already submitted");
    if (report._count.findings === 0)
      throw new BadRequestException("Cannot submit report with no findings");

    return this.prisma.auditReport.update({
      where: { id: reportId },
      data: {
        status: AuditReportStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });
  }

  async reviewReport(
    reportId: string,
    dto: ReviewReportDto,
    reviewerId: string,
  ) {
    const report = await this.prisma.auditReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException("Report not found");
    if (report.status !== AuditReportStatus.SUBMITTED)
      throw new BadRequestException("Report not submitted for review");

    return this.prisma.auditReport.update({
      where: { id: reportId },
      data: {
        status: dto.action as AuditReportStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes,
      },
    });
  }
}
