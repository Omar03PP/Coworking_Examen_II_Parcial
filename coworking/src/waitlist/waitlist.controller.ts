import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  join(@Req() req: any, @Body() dto: JoinWaitlistDto) {
    return this.waitlistService.join(req.user.userId, dto);
  }

  @Get('me')
  findMine(@Req() req: any) {
    return this.waitlistService.findMine(req.user.userId);
  }

  @Delete(':id')
  leave(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.waitlistService.leave(id, req.user.userId);
  }
}
