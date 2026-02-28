import { QRTagStatus, JobStatus } from "@assetsally/shared";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { QrGenerationProcessor } from "./qr-generation.processor";

@Injectable()
export class QrTagsService {
  constructor(
    private prisma: PrismaService,
    private qrProcessor: QrGenerationProcessor,
  ) {}

  async findAll(query?: {
    status?: string;
    batchId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page && !isNaN(query.page) ? query.page : 1;
    const limit = query?.limit && !isNaN(query.limit) ? query.limit : 50;
    const skip = Math.max(0, (page - 1) * limit);

    const where: any = {};
    if (query?.status && query.status !== "undefined")
      where.status = query.status;
    if (query?.batchId && query.batchId !== "undefined")
      where.batchId = query.batchId;

    const [tags, total] = await Promise.all([
      this.prisma.qRCodeTag.findMany({
        where,
        include: {
          binding: {
            include: {
              item: {
                select: { id: true, assetNumber: true, assetName: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { code: "asc" },
      }),
      this.prisma.qRCodeTag.count({ where }),
    ]);

    return {
      tags,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByCode(codeIdentifier: string) {
    // We check both the exact code or the hashString/URL if the scanner passed the raw URL
    const tag = await this.prisma.qRCodeTag.findFirst({
      where: {
        OR: [
          { code: codeIdentifier },
          { hashString: codeIdentifier },
          { url: codeIdentifier },
        ],
      },
      include: {
        binding: {
          include: {
            item: {
              include: {
                location: true,
                department: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`QR tag not found`);
    }

    return tag;
  }

  async generateBatch(count: number, prefix: string = "QR") {
    // Deprecated for the new Background Jobs, but keeping for backward compatibility
    // ... we can just delegate to the new system, or keep as is for very small batches
    throw new BadRequestException("Use initiateBatchGeneration instead");
  }

  async initiateBatchGeneration(
    baseUrl: string,
    totalCount: number,
    userId: string,
  ) {
    if (totalCount <= 0 || totalCount > 100000) {
      throw new BadRequestException("Invalid batch size");
    }

    const batchSize = 500;
    const numBatches = Math.ceil(totalCount / batchSize);

    // 1. Create Master Job
    const job = await this.prisma.qRGenerationJob.create({
      data: {
        baseUrl,
        totalCount,
        batchSize,
        status: JobStatus.PENDING,
        createdBy: userId,
      },
    });

    // 2. Create sub-batches & tags
    const startNum = 1;
    for (let i = 0; i < numBatches; i++) {
      const isLastBatch = i === numBatches - 1;
      const countForThisBatch =
        isLastBatch && totalCount % batchSize !== 0
          ? totalCount % batchSize
          : batchSize;

      const batch = await this.prisma.qRBatch.create({
        data: {
          jobId: job.id,
          batchNumber: i + 1,
          count: countForThisBatch,
          status: JobStatus.PENDING,
        },
      });

      // 3. Get next starting number from global settings in a transaction
      const startNumForThisBatch = await this.prisma.$transaction(
        async (tx) => {
          const settings = await tx.systemSettings.upsert({
            where: { id: "GLOBAL" },
            update: { lastQrCodeNumber: { increment: countForThisBatch } },
            create: { id: "GLOBAL", lastQrCodeNumber: countForThisBatch },
          });
          return settings.lastQrCodeNumber - countForThisBatch + 1;
        },
      );

      const tagsData = [];
      for (let j = 0; j < countForThisBatch; j++) {
        const currentSerial = startNumForThisBatch + j;
        const serialStr = currentSerial.toString().padStart(6, "0");
        const codeIdentifier = `QR-${serialStr}`;
        const urlToEncode = `${baseUrl}${baseUrl.endsWith("/") ? "" : "/"}${codeIdentifier}`;

        tagsData.push({
          code: codeIdentifier,
          url: urlToEncode,
          hashString: codeIdentifier,
          status: QRTagStatus.UNASSIGNED,
          batchId: batch.id,
        });
      }

      if (tagsData.length > 0) {
        await this.prisma.qRCodeTag.createMany({ data: tagsData });
      }
    }

    return { jobId: job.id, message: "Batch initiated and tags generated" };
  }

  async getJobs() {
    return this.prisma.qRGenerationJob.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { batches: true },
        },
        batches: {
          select: { status: true, id: true },
        },
      },
    });
  }

  async getBatches(jobId: string) {
    return this.prisma.qRBatch.findMany({
      where: { jobId },
      orderBy: { batchNumber: "asc" },
    });
  }

  async getBatch(batchId: string) {
    const batch = await this.prisma.qRBatch.findUnique({
      where: { id: batchId },
      include: { job: true },
    });
    if (!batch) throw new NotFoundException("Batch not found");
    return batch;
  }

  async markBatchDownloaded(batchId: string) {
    const batch = await this.getBatch(batchId);
    if (
      batch.status !== JobStatus.READY &&
      batch.status !== JobStatus.DOWNLOADED
    ) {
      throw new BadRequestException("Batch is not ready for download");
    }

    // Mark as downloaded so the cron can clean up the file and free buffer slots
    return this.prisma.qRBatch.update({
      where: { id: batchId },
      data: { status: JobStatus.DOWNLOADED },
    });
  }

  async generateBatchPdf(batchId: string) {
    const batch = await this.getBatch(batchId);
    if (
      batch.status !== JobStatus.PENDING &&
      batch.status !== JobStatus.FAILED
    ) {
      throw new BadRequestException(
        "Only PENDING or FAILED batches can generate PDFs manually.",
      );
    }

    // Call processor synchronously. Wait for the PDF to be saved.
    await this.qrProcessor.generatePdf(batchId);

    return { message: "PDF generated successfully" };
  }

  async assignToItem(
    tagCode: string,
    itemId: string,
    userId: string = "SYSTEM",
  ) {
    // 1. Find Tag (handle URL, hash, or code)
    const tag = await this.prisma.qRCodeTag.findFirst({
      where: {
        OR: [{ code: tagCode }, { hashString: tagCode }, { url: tagCode }],
      },
    });

    if (!tag) throw new NotFoundException("QR tag not found");
    if (tag.status !== QRTagStatus.UNASSIGNED)
      throw new BadRequestException("Tag is already assigned");

    // 2. Check if item already has a tag
    const existingBinding = await this.prisma.qRBindingRecord.findFirst({
      where: { itemId },
    });
    if (existingBinding)
      throw new BadRequestException("Item already has an assigned QR tag");

    // 3. Get item snapshot
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { location: true, department: true, category: true },
    });
    if (!item) throw new NotFoundException("Inventory item not found");

    // 4. Update Tag and create Binding Record in Transaction
    return this.prisma.$transaction(async (tx) => {
      const updatedTag = await tx.qRCodeTag.update({
        where: { id: tag.id },
        data: {
          status: QRTagStatus.ASSIGNED,
        },
      });

      const binding = await tx.qRBindingRecord.create({
        data: {
          qrTagId: tag.id,
          itemId: item.id,
          url: tag.url || tag.code,
          boundBy: userId,
          itemSnapshot: item as any, // Denormalized snapshot
        },
        include: {
          item: {
            select: { id: true, assetNumber: true, assetName: true },
          },
        },
      });

      return {
        ...updatedTag,
        binding,
      };
    });
  }

  async exportBindings() {
    const bindings = await this.prisma.qRBindingRecord.findMany({
      include: {
        qrTag: true,
        item: {
          include: { location: true, department: true, category: true },
        },
        user: true,
      },
    });

    if (bindings.length === 0) return "";

    const headers = [
      "QR Code",
      "QR URL",
      "Item ID",
      "Asset Number",
      "Asset Name",
      "Location Name",
      "Department Name",
      "Category Name",
      "Bound By",
      "Bound At",
    ].join(",");

    const rows = bindings.map((b) => {
      const locationName = b.item.location?.locationName || "";
      const deptName = b.item.department?.name || "";
      const catName = b.item.category?.name || "";

      return [
        b.qrTag.code,
        b.url,
        b.item.id,
        b.item.assetNumber,
        `"${b.item.assetName.replace(/"/g, '""')}"`,
        `"${locationName.replace(/"/g, '""')}"`,
        `"${deptName.replace(/"/g, '""')}"`,
        `"${catName.replace(/"/g, '""')}"`,
        `"${b.user.name.replace(/"/g, '""')}"`,
        b.boundAt.toISOString(),
      ].join(",");
    });

    return [headers, ...rows].join("\n");
  }

  async unassignFromItem(tagCode: string) {
    const tag = await this.prisma.qRCodeTag.findFirst({
      where: {
        OR: [{ code: tagCode }, { hashString: tagCode }, { url: tagCode }],
      },
      include: {
        binding: {
          include: {
            item: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    if (!tag) throw new NotFoundException("QR tag not found");
    if (!tag.binding) throw new BadRequestException("Tag is not assigned");

    const locationId = tag.binding.item.locationId;

    // Check for ANY submitted or approved report for this location
    // The requirement says "Audit report is not submitted. Once submitted, no QR binding can be changed."
    const submittedReport = await this.prisma.auditReport.findFirst({
      where: {
        locationId,
        status: {
          in: ["SUBMITTED", "APPROVED"],
        },
      },
    });

    if (submittedReport) {
      throw new BadRequestException(
        "Cannot unbind QR code because the audit report for this location has already been submitted.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete the binding record
      await tx.qRBindingRecord.delete({
        where: { id: tag.binding!.id },
      });

      // Reset the tag status to UNASSIGNED
      return tx.qRCodeTag.update({
        where: { id: tag.id },
        data: {
          status: QRTagStatus.UNASSIGNED,
          updatedAt: new Date(),
        },
      });
    });
  }

  async retire(tagCode: string) {
    const tag = await this.prisma.qRCodeTag.findUnique({
      where: { code: tagCode },
    });
    if (!tag) throw new NotFoundException("QR tag not found");

    return this.prisma.$transaction(async (tx) => {
      await tx.qRBindingRecord.deleteMany({
        where: { qrTagId: tag.id },
      });

      return tx.qRCodeTag.update({
        where: { code: tagCode },
        data: {
          status: QRTagStatus.RETIRED,
          retiredAt: new Date(),
        },
      });
    });
  }
}
