import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalSpaces,
      totalReservations,
      totalReviews,
      activeReservations,
      recentActivity,
      reservationsByDay,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.space.count({ where: { status: true } }),
      this.prisma.reservation.count(),
      this.prisma.review.count(),
      this.prisma.reservation.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      this.getReservationsByDay(7),
    ]);

    return {
      totalUsers,
      totalSpaces,
      totalReservations,
      totalReviews,
      activeReservations,
      recentActivity,
      reservationsByDay,
    };
  }

  private async getReservationsByDay(days: number) {
    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const count = await this.prisma.reservation.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
        },
      });

      result.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      });
    }
    return result;
  }
}
