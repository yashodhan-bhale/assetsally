import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
} from "class-validator";

export class CreateAuditReportDto {
  @ApiProperty({ example: "location-uuid" })
  @IsString()
  @IsNotEmpty()
  locationId: string;
}

export class SubmitFindingDto {
  @ApiProperty({ example: "item-uuid" })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    enum: ["FOUND", "NOT_FOUND", "RELOCATED", "DAMAGED", "DISPOSED"],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ enum: ["GOOD", "FAIR", "POOR", "NON_FUNCTIONAL"] })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ example: "Item found in good condition" })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  geoLat?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  geoLng?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  geoAccuracy?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customFieldValues?: Record<string, any>;
}

export class ReviewReportDto {
  @ApiProperty({ enum: ["APPROVED", "REJECTED"] })
  @IsString()
  @IsNotEmpty()
  action: "APPROVED" | "REJECTED";

  @ApiPropertyOptional({ example: "Report looks good" })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
