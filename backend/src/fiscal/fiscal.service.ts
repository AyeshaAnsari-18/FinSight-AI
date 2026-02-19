/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FiscalService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async runFiscalCloseAnalysis() {
    const [journals, tasks] = await Promise.all([
      this.prisma.journalEntry.groupBy({ by: ['status'], _count: { status: true } }),
      this.prisma.task.groupBy({ by: ['status', 'priority'], _count: { status: true } })
    ]);

    const payload = {
      journals: journals,
      tasks: tasks
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/orchestrate-fiscal-close', payload)
      );
      
      return response.data;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Failed to run Fiscal Close Orchestration.");
    }
  }
}
