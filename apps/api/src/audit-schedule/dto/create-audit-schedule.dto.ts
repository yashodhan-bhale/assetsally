import {
  IsDateString,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateAuditScheduleDto {
  @IsString()
  locationId: string;

  @IsDateString()
  scheduledDate: string;

  @IsArray()
  @IsString({ each: true })
  assignedAuditorIds: string[];

  @IsOptional()
  @IsBoolean()
  isOverrideLocked?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
