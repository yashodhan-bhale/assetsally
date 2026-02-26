import { QRTagStatus, JobStatus } from "@assetsally/shared";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { PrismaService } from "../prisma/prisma.service";

import { QrGenerationProcessor } from "./qr-generation.processor";
import { QrTagsService } from "./qr-tags.service";

describe("QrTagsService", () => {
    let service: QrTagsService;
    let prisma: PrismaService;
    let processor: QrGenerationProcessor;

    const mockPrismaService = {
        qRCodeTag: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            count: vi.fn(),
            createMany: vi.fn(),
            update: vi.fn(),
        },
        qRGenerationJob: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        qRBatch: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        qRBindingRecord: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
        inventoryItem: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn((cb) => cb(mockPrismaService)),
    };

    const mockQrProcessor = {
        generatePdf: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QrTagsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: QrGenerationProcessor,
                    useValue: mockQrProcessor,
                },
            ],
        }).compile();

        service = module.get<QrTagsService>(QrTagsService);
        prisma = module.get<PrismaService>(PrismaService);
        processor = module.get<QrGenerationProcessor>(QrGenerationProcessor);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("should return tags and pagination info", async () => {
            mockPrismaService.qRCodeTag.findMany.mockResolvedValue([{ id: "1", code: "QR1" }]);
            mockPrismaService.qRCodeTag.count.mockResolvedValue(1);

            const result = await service.findAll();

            expect(result.tags).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
        });
    });

    describe("findByCode", () => {
        it("should return a tag if found", async () => {
            const tag = { id: "1", code: "QR1" };
            mockPrismaService.qRCodeTag.findFirst.mockResolvedValue(tag);

            const result = await service.findByCode("QR1");
            expect(result).toEqual(tag);
        });

        it("should throw NotFoundException if tag not found", async () => {
            mockPrismaService.qRCodeTag.findFirst.mockResolvedValue(null);

            await expect(service.findByCode("INVALID")).rejects.toThrow(NotFoundException);
        });
    });

    describe("initiateBatchGeneration", () => {
        it("should create a job and batches/tags", async () => {
            const jobId = "job-123";
            mockPrismaService.qRGenerationJob.create.mockResolvedValue({ id: jobId });
            mockPrismaService.qRBatch.create.mockResolvedValue({ id: "batch-1", batchNumber: 1 });

            const result = await service.initiateBatchGeneration("http://localhost/q", 5, "user-1");

            expect(result.jobId).toBe(jobId);
            expect(mockPrismaService.qRGenerationJob.create).toHaveBeenCalled();
            expect(mockPrismaService.qRBatch.create).toHaveBeenCalled();
            expect(mockPrismaService.qRCodeTag.createMany).toHaveBeenCalled();
        });

        it("should throw BadRequestException for invalid count", async () => {
            await expect(service.initiateBatchGeneration("http://localhost/q", 0, "user-1")).rejects.toThrow(BadRequestException);
        });
    });

    describe("assignToItem", () => {
        it("should assign tag to item in a transaction", async () => {
            const tag = { id: "tag-1", code: "QR-001", status: QRTagStatus.UNASSIGNED };
            const item = { id: "item-1", assetNumber: "A001" };

            mockPrismaService.qRCodeTag.findFirst.mockResolvedValue(tag);
            mockPrismaService.qRBindingRecord.findFirst.mockResolvedValue(null);
            mockPrismaService.inventoryItem.findUnique.mockResolvedValue(item);
            mockPrismaService.qRCodeTag.update.mockResolvedValue({ ...tag, status: QRTagStatus.ASSIGNED });
            mockPrismaService.qRBindingRecord.create.mockResolvedValue({ id: "binding-1", qrTagId: tag.id, itemId: item.id });

            const result = await service.assignToItem("QR-001", "item-1", "user-1");

            expect(result.status).toBe(QRTagStatus.ASSIGNED);
            expect(mockPrismaService.$transaction).toHaveBeenCalled();
            expect(mockPrismaService.qRBindingRecord.create).toHaveBeenCalled();
        });

        it("should throw BadRequestException if tag already assigned", async () => {
            mockPrismaService.qRCodeTag.findFirst.mockResolvedValue({ status: QRTagStatus.ASSIGNED });

            await expect(service.assignToItem("QR-001", "item-1")).rejects.toThrow(BadRequestException);
        });
    });

    describe("retire", () => {
        it("should delete binding and update tag status", async () => {
            const tag = { id: "tag-1", code: "QR-001" };
            mockPrismaService.qRCodeTag.findUnique.mockResolvedValue(tag);

            await service.retire("QR-001");

            expect(mockPrismaService.qRBindingRecord.deleteMany).toHaveBeenCalledWith({
                where: { qrTagId: tag.id },
            });
            expect(mockPrismaService.qRCodeTag.update).toHaveBeenCalledWith({
                where: { code: "QR-001" },
                data: expect.objectContaining({ status: QRTagStatus.RETIRED }),
            });
        });
    });
});
