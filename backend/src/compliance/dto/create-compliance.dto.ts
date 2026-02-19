import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateComplianceDto {
  @IsString()
  @IsNotEmpty()
  riskName!: string;

  @IsString()
  @IsNotEmpty()
  controlDesc!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsDateString()
  @IsOptional()
  lastTested?: string;
}
