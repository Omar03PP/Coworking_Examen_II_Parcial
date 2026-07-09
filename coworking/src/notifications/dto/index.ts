import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: string;

  @IsString()
  message: string;
}

export class MarkReadDto {
  @IsOptional()
  ids?: number[];
}
