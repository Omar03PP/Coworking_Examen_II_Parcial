import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreateSpaceDto) {
    const space = await this.prisma.space.create({ data: dto });
    await this.activityLogsService.log(null, 'CREATE', 'Space', space.id, { name: dto.name });
    return space;
  }

  findAll(filters?: { type?: string; search?: string }) {
    const where: any = { status: true };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { location: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return this.prisma.space.findMany({
      where,
      include: { amenities: true },
    });
  }

  async findOne(id: number) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: { amenities: true },
    });
    if (!space) throw new NotFoundException('Espacio no encontrado');
    return space;
  }

  async update(id: number, dto: UpdateSpaceDto) {
    await this.findOne(id);
    return this.prisma.space.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.space.update({ where: { id }, data: { status: false } });
  }

  async getAvailableSlots(spaceId: number, date: string) {
    await this.findOne(spaceId);

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        spaceId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      orderBy: { startTime: 'asc' },
    });

    const slots: { hour: number; available: boolean }[] = [];
    for (let h = 7; h <= 20; h++) {
      const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:00:00.000Z`);
      const slotEnd = new Date(`${date}T${String(h).padStart(2, '0')}:00:00.000Z`);
      slotEnd.setHours(slotEnd.getHours() + 1);

      const isOccupied = reservations.some(
        (r) => slotStart < r.endTime && slotEnd > r.startTime,
      );

      slots.push({ hour: h, available: !isOccupied });
    }

    return slots;
  }
}
