import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AnalyzeJournalDto {
  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNumber()
  debit!: number;

  @IsNumber()
  credit!: number;

  @IsNotEmpty()
  @IsString()
  reference!: string;
}
