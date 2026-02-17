import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    @ApiOperation({ summary: 'Get all inventory items with filtering' })
    @ApiQuery({ name: 'locationId', required: false })
    @ApiQuery({ name: 'departmentId', required: false })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('locationId') locationId?: string,
        @Query('departmentId') departmentId?: string,
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inventoryService.findAll({
            locationId,
            departmentId,
            categoryId,
            search,
            page: page ? +page : 1,
            limit: limit ? +limit : 50,
        });
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get inventory statistics' })
    getStats() {
        return this.inventoryService.getStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get inventory item by ID' })
    findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(id);
    }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Create new inventory item' })
    create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
        return this.inventoryService.create(createInventoryItemDto);
    }

    @Post('import')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
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
    @ApiOperation({ summary: 'Bulk import inventory from Excel/CSV' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'Excel or CSV file' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Import results' })
    async bulkImport(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('No file uploaded');
        return this.inventoryService.bulkImport(file.buffer, file.originalname);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Update inventory item' })
    update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
        return this.inventoryService.update(id, updateInventoryItemDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Delete inventory item' })
    remove(@Param('id') id: string) {
        return this.inventoryService.remove(id);
    }
}
