/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ForecastService {
  private forecastCache: any = null;
  private forecastTimestamp: Date | null = null;
  
  private whatIfCache: any = null;
  private whatIfTimestamp: Date | null = null;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  private async getHistoricalData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const journals = await this.prisma.journalEntry.findMany({
      where: { date: { gte: sixMonthsAgo }, status: 'POSTED' }, 
    });

    const monthlyData: Record<string, { revenue: number, expenses: number }> = {};
    
    journals.forEach(entry => {
      const monthYear = entry.date.toISOString().substring(0, 7);
      if (!monthlyData[monthYear]) monthlyData[monthYear] = { revenue: 0, expenses: 0 };
      monthlyData[monthYear].revenue += Number(entry.credit);
      monthlyData[monthYear].expenses += Number(entry.debit);
    });

    return Object.keys(monthlyData).map(month => ({
      month, revenue: monthlyData[month].revenue, expenses: monthlyData[month].expenses
    }));
  }

  async generateForecast(forceRefresh: boolean) {
    if (!forceRefresh && this.forecastCache) {
      return { forecasts: this.forecastCache, lastUpdated: this.forecastTimestamp };
    }

    const data = await this.getHistoricalData();
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/predict-forecast', { historical_data: data })
      );
      
      this.forecastCache = response.data.forecasts || [];
      this.forecastTimestamp = new Date();
      
      return { forecasts: this.forecastCache, lastUpdated: this.forecastTimestamp };
    } catch (e) {
      throw new InternalServerErrorException("AI Engine failed to generate forecast.");
    }
  }

  async generateWhatIf(forceRefresh: boolean) {
    if (!forceRefresh && this.whatIfCache) {
      return { analyses: this.whatIfCache, lastUpdated: this.whatIfTimestamp };
    }

    const data = await this.getHistoricalData();
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/predict-what-if', { historical_data: data })
      );
      
      this.whatIfCache = response.data.analyses || [];
      this.whatIfTimestamp = new Date();
      
      return { analyses: this.whatIfCache, lastUpdated: this.whatIfTimestamp };
    } catch (e) {
      throw new InternalServerErrorException("AI Engine failed to generate what-if analysis.");
    }
  }
}
