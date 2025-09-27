import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  create(dto: { name: string; description?: string }) {
    return this.prisma.campaign.create({ data: dto });
  }

  findAll() {
    return this.prisma.campaign.findMany({
      include: { contents: true },
    });
  }

  findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { contents: true },
    });
  }
}
