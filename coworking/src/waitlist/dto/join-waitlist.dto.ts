import { IsDateString, IsInt } from 'class-validator';

export class JoinWaitlistDto {
  @IsInt()
  spaceId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
