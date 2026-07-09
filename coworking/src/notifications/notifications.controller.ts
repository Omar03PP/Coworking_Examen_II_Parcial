import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MarkReadDto } from './dto/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAll(req.user.userId);
  }

  @Get('unread/count')
  countUnread(@Req() req: any) {
    return this.notificationsService.countUnread(req.user.userId);
  }

  @Patch('read')
  markAsRead(@Req() req: any, @Body() dto: MarkReadDto) {
    return this.notificationsService.markAsRead(req.user.userId, dto.ids);
  }
}
