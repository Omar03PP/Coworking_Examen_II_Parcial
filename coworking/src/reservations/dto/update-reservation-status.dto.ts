import { IsIn } from 'class-validator';

export class UpdateReservationStatusDto {
  @IsIn(['CONFIRMED', 'CANCELLED', 'FINALIZED'])
  status: string;
}
