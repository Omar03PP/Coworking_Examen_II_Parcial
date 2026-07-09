import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, type: string, message: string) {
    return this.prisma.notification.create({ data: { userId, type, message } });
  }

  findAll(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  countUnread(userId: number) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markAsRead(userId: number, ids?: number[]) {
    if (ids && ids.length > 0) {
      await this.prisma.notification.updateMany({
        where: { id: { in: ids }, userId },
        data: { read: true },
      });
    } else {
      await this.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    }
    return { success: true };
  }
}
