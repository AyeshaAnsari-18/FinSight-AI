import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuditTrailDto {
  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
