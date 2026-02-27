import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";

import { JobStatus, QRTagStatus } from "@assetsally/shared";
import { Injectable, Logger } from "@nestjs/common";
import PDFDocument from "pdfkit";
import * as QRCode from "qrcode";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class QrGenerationProcessor {
  private readonly logger = new Logger(QrGenerationProcessor.name);
  constructor(private prisma: PrismaService) {}
  async generatePdf(batchId: string): Promise<string> {
    const batch = await this.prisma.qRBatch.findUnique({
      where: { id: batchId },
      include: { job: true, tags: { orderBy: { code: "asc" } } },
    });

    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    // Mark as generating
    await this.prisma.qRBatch.update({
      where: { id: batch.id },
      data: { status: JobStatus.GENERATING },
    });

    try {
      await this.ensureStorageDirectory();

      const filename = `batch-${batch.jobId}-${batch.batchNumber}.pdf`;
      const storageDir = join(process.cwd(), "uploads", "qr-batches");
      const fullPath = join(storageDir, filename);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writeStream = createWriteStream(fullPath);
      doc.pipe(writeStream);

      // Wait for file stream to finish writing
      const streamPromise = new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(undefined));
        writeStream.on("error", (err) => reject(err));
      });

      const codesPerPage = 10;
      const cols = 2;
      const rows = 5;

      const pageWidth = 595;
      const pageHeight = 842;
      const margin = 50;

      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const cellWidth = usableWidth / cols;
      const cellHeight = usableHeight / rows;

      const qrSize = Math.min(cellWidth, cellHeight) * 0.8;

      let itemsProcessed = 0;

      for (const tag of batch.tags) {
        // Generate QR image buffer
        const qrImageBuffer = await QRCode.toBuffer(tag.url || tag.code, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: qrSize,
        });

        const pageIndex = Math.floor(itemsProcessed / codesPerPage);
        const positionOnPage = itemsProcessed % codesPerPage;

        const col = positionOnPage % cols;
        const row = Math.floor(positionOnPage / cols);

        if (itemsProcessed > 0 && positionOnPage === 0) {
          doc.addPage();
        }

        const x = margin + col * cellWidth + (cellWidth - qrSize) / 2;
        const y = margin + row * cellHeight + (cellHeight - qrSize) / 2 - 10;

        doc.image(qrImageBuffer, x, y, { width: qrSize });
        doc.fontSize(10).text(tag.code, x, y + qrSize + 5, {
          width: qrSize,
          align: "center",
        });

        itemsProcessed++;
      }

      doc.end();
      await streamPromise;

      const pdfPath = `/uploads/qr-batches/${filename}`;

      // Mark as READY
      await this.prisma.qRBatch.update({
        where: { id: batch.id },
        data: {
          status: JobStatus.READY,
          pdfStoragePath: pdfPath,
        },
      });

      return pdfPath;
    } catch (error: any) {
      this.logger.error(`Failed to generate PDF for batch ${batchId}`, error);
      await this.prisma.qRBatch.update({
        where: { id: batch.id },
        data: { status: JobStatus.FAILED },
      });
      throw error;
    }
  }

  private async ensureStorageDirectory() {
    const dir = join(process.cwd(), "uploads", "qr-batches");
    try {
      await mkdir(dir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
}
