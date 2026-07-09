import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('reviews')
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, dto);
  }

  @Get('spaces/:spaceId/reviews')
  findBySpace(@Param('spaceId', ParseIntPipe) spaceId: number) {
    return this.reviewsService.findBySpace(spaceId);
  }

  @Get('spaces/:spaceId/reviews/stats')
  getStats(@Param('spaceId', ParseIntPipe) spaceId: number) {
    return this.reviewsService.getSpaceStats(spaceId);
  }
}
