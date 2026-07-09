import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async join(userId: number, dto: JoinWaitlistDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime debe ser posterior a startTime');
    }

    const existing = await this.prisma.waitlist.findUnique({
      where: { userId_spaceId_startTime_endTime: { userId, spaceId: dto.spaceId, startTime, endTime } },
    });
    if (existing) {
      throw new BadRequestException('Ya estás en la lista de espera para este horario');
    }

    return this.prisma.waitlist.create({
      data: { userId, spaceId: dto.spaceId, startTime, endTime },
    });
  }

  async leave(id: number, userId: number) {
    const entry = await this.prisma.waitlist.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) throw new NotFoundException('Entrada no encontrada');
    return this.prisma.waitlist.delete({ where: { id } });
  }

  findMine(userId: number) {
    return this.prisma.waitlist.findMany({
      where: { userId, status: 'WAITING' },
      include: { space: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async notifyOnCancellation(spaceId: number, startTime: Date, endTime: Date) {
    const waiting = await this.prisma.waitlist.findMany({
      where: {
        spaceId,
        startTime: { lte: startTime },
        endTime: { gte: endTime },
        status: 'WAITING',
      },
      include: { space: true, user: true },
    });

    for (const entry of waiting) {
      const msg = `El espacio ${entry.space.name} tiene un horario disponible (${startTime.toLocaleString()}) que te interesaba`;
      await this.notificationsService.create(entry.userId, 'WAITLIST_AVAILABLE', msg);
      await this.prisma.waitlist.update({
        where: { id: entry.id },
        data: { status: 'NOTIFIED' },
      });
    }

    return { notified: waiting.length };
  }
}
