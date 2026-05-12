import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
