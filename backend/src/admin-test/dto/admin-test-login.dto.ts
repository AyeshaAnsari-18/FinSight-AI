import { IsNotEmpty, IsString } from 'class-validator';

export class AdminTestLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
