import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from "class-validator";

export class CreateLocationDto {
  @ApiProperty({ example: "SITE-001" })
  @IsString()
  @IsNotEmpty()
  locationCode: string;

  @ApiProperty({ example: "Main Office" })
  @IsString()
  @IsNotEmpty()
  locationName: string;

  @ApiPropertyOptional({ example: "Main office building" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "ROOT.SITE-001" })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 1, description: "Depth level (0-3, max 4 levels)" })
  @IsInt()
  @Min(0)
  @Max(3)
  depth: number;

  @ApiProperty({ example: "Site" })
  @IsString()
  @IsNotEmpty()
  levelLabel: string;

  @ApiPropertyOptional({ example: "uuid-of-parent" })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: "Updated Office Name" })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiPropertyOptional({ example: "Updated description" })
  @IsString()
  @IsOptional()
  description?: string;
}
