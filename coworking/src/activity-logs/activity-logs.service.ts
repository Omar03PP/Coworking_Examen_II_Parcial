import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: number | null, action: string, entity: string, entityId?: number, metadata?: Record<string, any>) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.activityLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  count() {
    return this.prisma.activityLog.count();
  }
}
