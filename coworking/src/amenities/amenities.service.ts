import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAmenityDto) {
    return this.prisma.amenity.create({ data: dto });
  }

  findBySpace(spaceId: number) {
    return this.prisma.amenity.findMany({ where: { spaceId } });
  }

  async findOne(id: number) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new NotFoundException('Amenidad no encontrada');
    return amenity;
  }

  async update(id: number, dto: UpdateAmenityDto) {
    await this.findOne(id);
    return this.prisma.amenity.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.amenity.delete({ where: { id } });
  }
}
