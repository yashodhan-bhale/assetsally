import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateLocationDto {
    @ApiProperty({ example: 'SITE-001' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Main Office' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Main office building' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'ROOT.SITE-001' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({ example: 1, description: 'Depth level (0-4, max 5 levels)' })
    @IsInt()
    @Min(0)
    @Max(4)
    depth: number;

    @ApiProperty({ example: 'Site' })
    @IsString()
    @IsNotEmpty()
    levelLabel: string;

    @ApiPropertyOptional({ example: 'uuid-of-parent' })
    @IsString()
    @IsOptional()
    parentId?: string;
}

export class UpdateLocationDto {
    @ApiPropertyOptional({ example: 'Updated Office Name' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsString()
    @IsOptional()
    description?: string;
}
