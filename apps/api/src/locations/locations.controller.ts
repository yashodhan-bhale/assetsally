import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all locations' })
    @ApiQuery({ name: 'parentId', required: false, description: 'Filter by parent location' })
    @ApiQuery({ name: 'depth', required: false, type: Number, description: 'Filter by depth level (0-4)' })
    async findAll(@Query('parentId') parentId?: string, @Query('depth') depth?: string) {
        return this.locationsService.findAll({
            parentId,
            depth: depth ? parseInt(depth, 10) : undefined,
        });
    }

    @Get('tree')
    @ApiOperation({ summary: 'Get location hierarchy tree' })
    async findTree() {
        return this.locationsService.findTree();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a location by ID' })
    @ApiResponse({ status: 404, description: 'Location not found' })
    async findOne(@Param('id') id: string) {
        return this.locationsService.findOne(id);
    }

    @Get(':id/subtree')
    @ApiOperation({ summary: 'Get all location IDs in the subtree (cascading access)' })
    @ApiResponse({ status: 200, description: 'Array of location IDs in the subtree' })
    async getSubtree(@Param('id') id: string) {
        const ids = await this.locationsService.getSubtreeIds(id);
        return { locationId: id, subtreeIds: ids, count: ids.length };
    }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Create a new location' })
    async create(@Body() dto: CreateLocationDto) {
        return this.locationsService.create(dto);
    }

    @Post('import')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
        fileFilter: (_req, file, cb) => {
            const allowed = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
                'text/csv',
                'application/csv',
            ];
            if (allowed.includes(file.mimetype) || /\.(xlsx|xls|csv)$/i.test(file.originalname)) {
                cb(null, true);
            } else {
                cb(new Error('Only Excel (.xlsx/.xls) and CSV files are supported'), false);
            }
        },
    }))
    @ApiOperation({
        summary: 'Bulk import locations from Excel/CSV',
        description: 'Upload a file with columns: L1 Code, L1 Name, L2 Code, L2 Name, ... L5 Code, L5 Name. ' +
            'Import is idempotent: re-importing updates names but preserves IDs.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'Excel or CSV file' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Import results with created/updated/skipped counts' })
    @ApiResponse({ status: 400, description: 'Invalid file or data format' })
    async bulkImport(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return this.locationsService.bulkImport(file.buffer, file.originalname);
    }

    @Put(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Update a location' })
    async update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
        return this.locationsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Delete a location' })
    async remove(@Param('id') id: string) {
        return this.locationsService.remove(id);
    }
}
