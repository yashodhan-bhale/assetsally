import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsObject, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateInventoryItemDto {
    @ApiProperty({ example: 'ASSET-004' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'HP Monitor 24"' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: '24-inch LED monitor' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'location-uuid' })
    @IsString()
    @IsNotEmpty()
    locationId: string;

    @ApiPropertyOptional({ example: 'department-uuid' })
    @IsString()
    @IsOptional()
    departmentId?: string;

    @ApiPropertyOptional({ example: 'category-uuid' })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ example: { serialNumber: 'SN12345', warrantyEnd: '2025-12-31' } })
    @ApiPropertyOptional({ example: { warranty: '2 years' } })
    @IsObject()
    @IsOptional()
    customFields?: Record<string, any>;

    // New Fields
    @ApiPropertyOptional({ example: '2023-01-15' })
    @IsDateString()
    @IsOptional()
    purchaseDate?: string;

    @ApiPropertyOptional({ example: 1500.00 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    cost?: number;

    @ApiPropertyOptional({ example: 1200.00 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    bookValue?: number;

    @ApiPropertyOptional({ example: 'US-Ops' })
    @IsString()
    @IsOptional()
    profitCenter?: string;

    @ApiPropertyOptional({ example: 'Ultrabook' })
    @IsString()
    @IsOptional()
    subCategory?: string;

    @ApiPropertyOptional({ example: 'EA' })
    @IsString()
    @IsOptional()
    unitOfMeasure?: string;
}

export class UpdateInventoryItemDto {
    @ApiPropertyOptional({ example: 'Updated Laptop Name' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'uuid-of-location' })
    @IsString()
    @IsOptional()
    locationId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-department' })
    @IsString()
    @IsOptional()
    departmentId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-category' })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    customFields?: Record<string, any>;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    purchaseDate?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    cost?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    bookValue?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    profitCenter?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subCategory?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    unitOfMeasure?: string;
}
