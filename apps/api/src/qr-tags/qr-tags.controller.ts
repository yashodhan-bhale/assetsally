import { createReadStream } from "fs";
import * as fs from "fs";
import { join } from "path";

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Response } from "express";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { QrTagsService } from "./qr-tags.service";

@ApiTags("QR Tags")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("qr-tags")
export class QrTagsController {
  constructor(private readonly qrTagsService: QrTagsService) {}

  @Get()
  @ApiOperation({ summary: "Get all QR tags (paginated)" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["UNASSIGNED", "ASSIGNED", "RETIRED"],
  })
  @ApiQuery({ name: "batchId", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(
    @Query("status") status?: string,
    @Query("batchId") batchId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.qrTagsService.findAll({
      status,
      batchId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("jobs")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get all QR generation jobs" })
  async getJobs() {
    return this.qrTagsService.getJobs();
  }

  @Get("jobs/:jobId/batches")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get batches for a specific job" })
  async getBatches(@Param("jobId") jobId: string) {
    return this.qrTagsService.getBatches(jobId);
  }

  @Post("batch/async")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Initiate background QR batch generation" })
  async generateBatchAsync(
    @Body() body: { baseUrl: string; count: number },
    @Req() req: any,
  ) {
    return this.qrTagsService.initiateBatchGeneration(
      body.baseUrl,
      body.count,
      req.user.id,
    );
  }

  @Get("batches/:batchId/download")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Download batch PDF" })
  async downloadBatchPdf(
    @Param("batchId") batchId: string,
    @Res() res: Response,
  ) {
    const batch = await this.qrTagsService.getBatch(batchId);

    if (batch.status !== "READY" && batch.status !== "DOWNLOADED") {
      return res.status(400).json({ message: "PDF is not ready" });
    }

    if (!batch.pdfStoragePath) {
      return res.status(404).json({ message: "PDF path not found" });
    }

    const fullPath = join(process.cwd(), batch.pdfStoragePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "PDF file not found on disk" });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=QR_Batch_${batch.jobId}_${batch.batchNumber}.pdf`,
    });

    const fileStream = createReadStream(fullPath);
    fileStream.pipe(res);

    // After starting the stream, if this is the first download, mark it
    if (batch.status === "READY") {
      fileStream.on("end", async () => {
        try {
          await this.qrTagsService.markBatchDownloaded(batch.id);
        } catch (e) {
          console.error("Failed to mark batch downloaded", e);
        }
      });
    }
  }

  @Post("batches/:batchId/generate-pdf")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Generate PDF for a batch manually",
  })
  async generateBatchPdf(@Param("batchId") batchId: string) {
    return this.qrTagsService.generateBatchPdf(batchId);
  }

  @Get("export-bindings")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Export QR bindings to CSV" })
  async exportBindings(@Res() res: Response) {
    const csvContent = await this.qrTagsService.exportBindings();
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=qr_bindings.csv",
    });
    return res.send(csvContent);
  }

  @Post("generate")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Legacy: Generate a batch of QR tags synchronously",
  })
  async generateBatch(@Body() body: { count: number; prefix?: string }) {
    return this.qrTagsService.generateBatch(body.count, body.prefix);
  }

  @Get(":code")
  @ApiOperation({ summary: "Look up a QR tag by code (used when scanning)" })
  async findByCode(@Param("code") code: string) {
    return this.qrTagsService.findByCode(code);
  }

  @Post(":code/assign")
  @Roles("ADMIN", "SUPER_ADMIN", "AUDITOR")
  @ApiOperation({ summary: "Assign a QR tag to an inventory item" })
  async assign(
    @Param("code") code: string,
    @Body() body: { itemId: string },
    @Req() req: any,
  ) {
    return this.qrTagsService.assignToItem(code, body.itemId, req.user.id);
  }

  @Post(":code/retire")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Retire a QR tag" })
  async retire(@Param("code") code: string) {
    return this.qrTagsService.retire(code);
  }
}
