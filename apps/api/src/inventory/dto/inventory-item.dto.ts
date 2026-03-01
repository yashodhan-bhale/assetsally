import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsDateString,
  IsNumber,
  Min,
} from "class-validator";

export class CreateInventoryItemDto {
  @ApiProperty({ example: "ASSET-004" })
  @IsString()
  @IsNotEmpty()
  assetNumber: string;

  @ApiProperty({ example: 'HP Monitor 24"' })
  @IsString()
  @IsNotEmpty()
  assetName: string;

  @ApiPropertyOptional({ example: "24-inch LED monitor" })
  @IsString()
  @IsOptional()
  assetDescription?: string;

  @ApiProperty({ example: "location-uuid" })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiPropertyOptional({ example: "department-uuid" })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: "category-uuid" })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: { warranty: "2 years" } })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ example: "2023-01-15" })
  @IsDateString()
  @IsOptional()
  capitalizationDate?: string;

  @ApiPropertyOptional({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  acquisitionCost?: number;

  @ApiPropertyOptional({ example: 1200.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  netBookValue?: number;

  @ApiPropertyOptional({ example: "US-Ops" })
  @IsString()
  @IsOptional()
  profitCenter?: string;

  @ApiPropertyOptional({ example: "Ultrabook" })
  @IsString()
  @IsOptional()
  subCategory?: string;

  @ApiPropertyOptional({ example: "EA" })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityAsPerBooks?: number;

  @ApiPropertyOptional({ example: "Found ok" })
  @IsString()
  @IsOptional()
  inventoryStatus?: string;

  @ApiPropertyOptional({ example: 500.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  accumulatedDepreciation?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityAsPerPhysical?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  quantityDifference?: number;

  @ApiPropertyOptional({ example: "TAG-12345" })
  @IsString()
  @IsOptional()
  biometricTag?: string;

  @ApiPropertyOptional({ example: "Imported from legacy system" })
  @IsString()
  @IsOptional()
  importRemarks?: string;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: "Updated Laptop Name" })
  @IsString()
  @IsOptional()
  assetName?: string;

  @ApiPropertyOptional({ example: "Updated description" })
  @IsString()
  @IsOptional()
  assetDescription?: string;

  @ApiPropertyOptional({ example: "uuid-of-location" })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({ example: "uuid-of-department" })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: "uuid-of-category" })
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
  capitalizationDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  acquisitionCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  netBookValue?: number;

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

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityAsPerBooks?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  inventoryStatus?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  accumulatedDepreciation?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantityAsPerPhysical?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantityDifference?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  biometricTag?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  importRemarks?: string;
}
