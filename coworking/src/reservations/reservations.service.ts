import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'];

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
    private readonly notificationsService: NotificationsService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly waitlistService: WaitlistService,
  ) {}

  async create(userId: number, dto: CreateReservationDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime debe ser posterior a startTime');
    }

    const space = await this.spacesService.findOne(dto.spaceId);

    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        spaceId: dto.spaceId,
        status: { in: ACTIVE_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new BadRequestException('El espacio ya está reservado en ese horario');
    }

    const reservation = await this.prisma.reservation.create({
      data: { ...dto, startTime, endTime, userId },
    });

    await this.activityLogsService.log(userId, 'CREATE', 'Reservation', reservation.id, { spaceId: dto.spaceId });
    return reservation;
  }

  findAll() {
    return this.prisma.reservation.findMany({
      include: {
        space: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  findMine(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    return reservation;
  }

  async updateStatus(id: number, userId: number, role: string, dto: UpdateReservationStatusDto) {
    const reservation = await this.findOne(id);

    const isOwner = reservation.userId === userId;
    if (!isOwner && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes modificar esta reserva');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: { space: true },
    });

    const statusLabels: Record<string, string> = {
      CONFIRMED: 'confirmó',
      CANCELLED: 'canceló',
      FINALIZED: 'finalizó',
    };
    const label = statusLabels[dto.status] || dto.status;
    const msg = `${updated.space.name} ${label} tu reserva del ${new Date(updated.startTime).toLocaleDateString()}`;
    await this.notificationsService.create(reservation.userId, 'RESERVATION_STATUS', msg);
    await this.activityLogsService.log(userId, 'UPDATE_STATUS', 'Reservation', id, { from: reservation.status, to: dto.status });

    if (dto.status === 'CANCELLED') {
      await this.waitlistService.notifyOnCancellation(updated.spaceId, updated.startTime, updated.endTime);
    }

    return updated;
  }

  async remove(id: number, userId: number, role: string) {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes eliminar esta reserva');
    }
    await this.activityLogsService.log(userId, 'DELETE', 'Reservation', id);
    return this.prisma.reservation.delete({ where: { id } });
  }

  async autoFinalize() {
    const now = new Date();
    const result = await this.prisma.reservation.updateMany({
      where: {
        status: 'CONFIRMED',
        endTime: { lt: now },
      },
      data: { status: 'FINALIZED' },
    });
    return { finalized: result.count };
  }
}
