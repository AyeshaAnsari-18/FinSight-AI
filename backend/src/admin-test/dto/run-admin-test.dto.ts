import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class RunAdminTestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suiteIds?: string[];

  @IsOptional()
  @IsBoolean()
  includeAi?: boolean;
}
