import { IsInt } from 'class-validator';

export class ToggleFavoriteDto {
  @IsInt()
  spaceId: number;
}
