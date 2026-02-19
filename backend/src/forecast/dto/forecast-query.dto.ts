import { IsOptional, IsBooleanString } from 'class-validator';

export class ForecastQueryDto {
  @IsOptional()
  @IsBooleanString()
  force?: string;
}
