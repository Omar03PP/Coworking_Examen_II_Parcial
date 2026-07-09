import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAmenityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsInt()
  spaceId: number;
}
