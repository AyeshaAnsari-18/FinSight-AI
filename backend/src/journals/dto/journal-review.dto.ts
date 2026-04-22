import { JournalStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class JournalReviewDto {
  @IsOptional()
  @IsString()
  scope?: 'all' | 'selected' | 'dateRange' | 'currentMonth' | 'currentQuarter' | 'currentYear';

  @IsOptional()
  @IsString()
  journalId?: string;

  @IsOptional()
  @IsEnum(JournalStatus)
  status?: JournalStatus;

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
