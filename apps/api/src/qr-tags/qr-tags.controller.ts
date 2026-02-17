import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";

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

  @Get(":code")
  @ApiOperation({ summary: "Look up a QR tag by code (used when scanning)" })
  async findByCode(@Param("code") code: string) {
    return this.qrTagsService.findByCode(code);
  }

  @Post("generate")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Generate a batch of QR tags" })
  async generateBatch(@Body() body: { count: number; prefix?: string }) {
    return this.qrTagsService.generateBatch(body.count, body.prefix);
  }

  @Post(":code/assign")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Assign a QR tag to an inventory item" })
  async assign(@Param("code") code: string, @Body() body: { itemId: string }) {
    return this.qrTagsService.assignToItem(code, body.itemId);
  }

  @Post(":code/retire")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Retire a QR tag" })
  async retire(@Param("code") code: string) {
    return this.qrTagsService.retire(code);
  }
}
