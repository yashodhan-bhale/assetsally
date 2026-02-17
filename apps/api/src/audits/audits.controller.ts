import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { CreateAuditReportDto, SubmitFindingDto, ReviewReportDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Audits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audits')
export class AuditsController {
    constructor(private readonly auditsService: AuditsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all audit reports (paginated)' })
    @ApiQuery({ name: 'locationId', required: false })
    @ApiQuery({ name: 'auditorId', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async findAll(
        @Query('locationId') locationId?: string,
        @Query('auditorId') auditorId?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditsService.findAll({
            locationId,
            auditorId,
            status,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an audit report by ID' })
    async findOne(@Param('id') id: string) {
        return this.auditsService.findOne(id);
    }

    @Post()
    @Roles('AUDITOR', 'ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Create a new audit report' })
    async create(@Body() dto: CreateAuditReportDto, @Req() req: any) {
        return this.auditsService.create(dto, req.user.id);
    }

    @Post(':id/findings')
    @Roles('AUDITOR', 'ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Submit a finding for an audit report' })
    async submitFinding(@Param('id') id: string, @Body() dto: SubmitFindingDto, @Req() req: any) {
        return this.auditsService.submitFinding(id, dto, req.user.id);
    }

    @Post(':id/submit')
    @Roles('AUDITOR', 'ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Submit an audit report for review' })
    async submitReport(@Param('id') id: string, @Req() req: any) {
        return this.auditsService.submitReport(id, req.user.id);
    }

    @Post(':id/review')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Review (approve/reject) an audit report' })
    async reviewReport(@Param('id') id: string, @Body() dto: ReviewReportDto, @Req() req: any) {
        return this.auditsService.reviewReport(id, dto, req.user.id);
    }
}
