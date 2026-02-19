import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateReconcileDto {
  @IsDateString()
  @IsNotEmpty()
  month!: string;

  @IsNumber()
  bankBalance!: number;

  @IsNumber()
  ledgerBalance!: number;

  @IsString()
  notes!: string;
}
