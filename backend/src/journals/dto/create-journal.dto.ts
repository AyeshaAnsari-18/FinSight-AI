/* eslint-disable prettier/prettier */
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { JournalStatus } from '@prisma/client';

export class CreateJournalDto {
  @IsNotEmpty()
  @IsDateString()
  date!: string; 

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  reference!: string;

  @IsNumber()
  debit!: number;

  @IsNumber()
  credit!: number;

  @IsOptional()
  @IsEnum(JournalStatus)
  status?: JournalStatus; 
}