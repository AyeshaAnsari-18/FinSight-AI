/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReconcileDto } from './dto/create-reconcile.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ReconcileService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService, 
  ) {}

  async createAndAnalyze(dto: CreateReconcileDto) {
    let aiResult;
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/analyze-reconciliation', {
          bank_balance: dto.bankBalance,
          ledger_balance: dto.ledgerBalance,
          notes: dto.notes,
        }),
      );
      aiResult = response.data;
    } catch (error) {
      throw new InternalServerErrorException('AI Engine failed during reconciliation.');
    }

    return this.prisma.reconciliation.create({
      data: {
        month: new Date(dto.month),
        bankBalance: dto.bankBalance,
        ledgerBalance: dto.ledgerBalance,
        variance: aiResult.variance,
        status: aiResult.matched ? 'MATCHED' : 'DISCREPANCY',
        notes: JSON.stringify(aiResult.discrepancies),
      },
    });
  }

  async findAll() {
    return this.prisma.reconciliation.findMany({
      orderBy: { month: 'desc' },
    });
  }
}
