import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnalyzeReconcileDto {
  @IsNumber()
  bankBalance!: number;

  @IsNumber()
  ledgerBalance!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
