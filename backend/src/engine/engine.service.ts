/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { lastValueFrom } from 'rxjs';

export interface JournalAnalysisPayload {
  description: string;
  debit: number;
  credit: number;
  reference: string;
}

export interface ReconciliationAnalysisPayload {
  bank_balance: number;
  ledger_balance: number;
  notes: string;
}

export interface FiscalClosePayload {
  journals: unknown[];
  tasks: unknown[];
}

export interface ForecastPayload {
  historical_data: unknown[];
}

export interface CopilotPayload {
  role: string;
  message: string;
  context: string;
  history: unknown[];
}

@Injectable()
export class EngineService {
  private readonly engineUrl = process.env.ENGINE_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  private async postToEngine<T>(
    path: string,
    payload: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await lastValueFrom(
        this.httpService.post<T>(`${this.engineUrl}${path}`, payload, config),
      );

      return response.data;
    } catch (error) {
      console.error(`Python Engine Error (${path}):`, error);
      throw new InternalServerErrorException('AI Engine is currently unreachable.');
    }
  }

  async analyzeJournal(journalData: JournalAnalysisPayload) {
    return this.postToEngine('/analyze-journal', journalData);
  }

  async analyzeWithAI(journalData: JournalAnalysisPayload) {
    return this.analyzeJournal(journalData);
  }

  async analyzeReconciliation(payload: ReconciliationAnalysisPayload) {
    return this.postToEngine('/analyze-reconciliation', payload);
  }

  async orchestrateFiscalClose(payload: FiscalClosePayload) {
    return this.postToEngine('/orchestrate-fiscal-close', payload);
  }

  async predictForecast(payload: ForecastPayload) {
    return this.postToEngine('/predict-forecast', payload);
  }

  async predictWhatIf(payload: ForecastPayload) {
    return this.postToEngine('/predict-what-if', payload);
  }

  async runCopilotRag(payload: CopilotPayload) {
    return this.postToEngine('/copilot/rag', payload);
  }

  async extractWithAI(file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No document was provided for OCR extraction.');
    }

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    return this.postToEngine('/extract-document', formData, {
      headers: formData.getHeaders(),
    });
  }
}
