import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";

import { JobStatus } from "@assetsally/shared";
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";

import { PrismaService } from "../prisma/prisma.service";

import { QrGenerationProcessor } from "./qr-generation.processor";

// Mock nested dependencies
vi.mock("fs", () => ({
  createWriteStream: vi.fn().mockImplementation(() => {
    const stream = {
      on: vi.fn((event, cb) => {
        if (event === "finish") setTimeout(cb, 50);
        return stream;
      }),
      pipe: vi.fn().mockReturnThis(),
    };
    return stream;
  }),
}));

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("pdfkit", () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        pipe: vi.fn(),
        image: vi.fn(),
        fontSize: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        addPage: vi.fn(),
        end: vi.fn(),
      };
    }),
  };
});

vi.mock("qrcode", () => ({
  toBuffer: vi.fn().mockResolvedValue(Buffer.from("mock-qr")),
}));

describe("QrGenerationProcessor", () => {
  let processor: QrGenerationProcessor;
  let prisma: PrismaService;

  const mockPrismaService = {
    qRBatch: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    prisma = mockPrismaService as any;
    processor = new QrGenerationProcessor(prisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePdf", () => {
    it("should generate a PDF and update batch status", async () => {
      const batchId = "batch-1";
      const batchData = {
        id: batchId,
        jobId: "job-1",
        batchNumber: 1,
        tags: [
          { code: "QR-001", url: "http://q/1" },
          { code: "QR-002", url: "http://q/2" },
        ],
      };

      mockPrismaService.qRBatch.findUnique.mockResolvedValue(batchData);
      mockPrismaService.qRBatch.update.mockResolvedValue({});

      const result = await processor.generatePdf(batchId);

      expect(result).toContain("batch-job-1-1.pdf");
      expect(mockPrismaService.qRBatch.update).toHaveBeenCalledWith({
        where: { id: batchId },
        data: { status: JobStatus.GENERATING },
      });
      expect(mockPrismaService.qRBatch.update).toHaveBeenCalledWith({
        where: { id: batchId },
        data: expect.objectContaining({
          status: JobStatus.READY,
          pdfStoragePath: expect.stringContaining(".pdf"),
        }),
      });
    });

    it("should throw error and mark batch as FAILED if batch not found", async () => {
      mockPrismaService.qRBatch.findUnique.mockResolvedValue(null);

      await expect(processor.generatePdf("invalid")).rejects.toThrow(
        "Batch not found",
      );
    });

    it("should mark batch as FAILED on processing error", async () => {
      mockPrismaService.qRBatch.findUnique.mockResolvedValue({
        id: "1",
        tags: [],
      });
      const err = new Error("Disk error") as any;
      err.code = "EPERM";
      (mkdir as Mock).mockRejectedValue(err);

      await expect(processor.generatePdf("1")).rejects.toThrow("Disk error");
      expect(mockPrismaService.qRBatch.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { status: JobStatus.FAILED },
      });
    });
  });
});
