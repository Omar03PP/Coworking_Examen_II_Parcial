import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(userId: number, dto: CreateReviewDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
    });

    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    if (reservation.userId !== userId) throw new ForbiddenException('No puedes reseñar una reserva que no te pertenece');
    if (reservation.status !== 'FINALIZED') throw new BadRequestException('Solo puedes reseñar reservas finalizadas');

    const existing = await this.prisma.review.findUnique({
      where: { reservationId: dto.reservationId },
    });
    if (existing) throw new BadRequestException('Esta reserva ya tiene una reseña');

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        userId,
        spaceId: reservation.spaceId,
        reservationId: dto.reservationId,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    await this.activityLogsService.log(userId, 'CREATE', 'Review', review.id, { spaceId: reservation.spaceId, rating: dto.rating });
    return review;
  }

  findBySpace(spaceId: number) {
    return this.prisma.review.findMany({
      where: { spaceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSpaceStats(spaceId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { spaceId },
      select: { rating: true },
    });

    if (reviews.length === 0) return { average: 0, count: 0 };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }
}
