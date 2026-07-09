import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: number, spaceId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, spaceId } });
    return { favorited: true };
  }

  findAll(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { space: { include: { amenities: true } } },
    });
  }
}
