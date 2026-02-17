import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";

import { ImportsService } from "./imports.service";

@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body("type") type: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    if (!type || (type !== "locations" && type !== "inventory")) {
      throw new BadRequestException(
        'Invalid import type. Must be "locations" or "inventory"',
      );
    }

    return this.importsService.processImport(
      file,
      type as "locations" | "inventory",
    );
  }

  @Delete("wipe")
  async wipeData() {
    return this.importsService.wipeData();
  }
}
