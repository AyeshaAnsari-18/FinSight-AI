import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJournalDto) {
    return this.prisma.journalEntry.create({
      data: {
        date: new Date(dto.date),
        description: dto.description,
        reference: dto.reference,
        debit: dto.debit,
        credit: dto.credit,
        status: dto.status || 'DRAFT',
      },
    });
  }

  async findAll() {
    return this.prisma.journalEntry.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const journal = await this.prisma.journalEntry.findUnique({
      where: { id },
    });
    if (!journal) throw new NotFoundException(`Journal entry ${id} not found`);
    return journal;
  }

  async update(id: string, dto: UpdateJournalDto) {
    await this.findOne(id);

    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.journalEntry.delete({ where: { id } });
  }
}
