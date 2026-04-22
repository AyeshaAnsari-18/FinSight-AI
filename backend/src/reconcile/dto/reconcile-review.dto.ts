import { ReconStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ReconcileReviewDto {
  @IsOptional()
  @IsString()
  scope?: 'all' | 'selected' | 'dateRange' | 'currentMonth' | 'currentQuarter' | 'currentYear';

  @IsOptional()
  @IsString()
  reconciliationId?: string;

  @IsOptional()
  @IsEnum(ReconStatus)
  status?: ReconStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
