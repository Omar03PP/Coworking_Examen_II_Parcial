import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  toggle(@Req() req: any, @Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(req.user.userId, dto.spaceId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.userId);
  }
}
