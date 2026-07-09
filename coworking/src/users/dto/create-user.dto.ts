import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
