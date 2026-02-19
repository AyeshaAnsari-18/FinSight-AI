/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EngineService {
  constructor(private readonly httpService: HttpService) {}

  async analyzeWithAI(journalData: { description: string; debit: number; credit: number; reference: string }) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/analyze-journal', journalData),
      );
      return response.data;
    } catch (error) {
      console.error('Python Engine Error:', error);
      throw new InternalServerErrorException('AI Engine is currently unreachable.');
    }
  }

  async extractWithAI(file: Express.Multer.File) {
    const formData = new FormData();
    const fileBlob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    formData.append('file', fileBlob, file.originalname);
    const response = await lastValueFrom(
      this.httpService.post('http://localhost:8000/extract-document', formData, {
      })
    );

    return response.data;
  }
}