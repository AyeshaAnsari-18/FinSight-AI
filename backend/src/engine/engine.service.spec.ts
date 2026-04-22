import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { EngineService } from './engine.service';

describe('EngineService', () => {
  const httpService = {
    post: jest.fn(),
  } as unknown as HttpService;

  let service: EngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EngineService(httpService);
  });

  it('posts journal analysis requests to the engine endpoint', async () => {
    (httpService.post as jest.Mock).mockReturnValue(
      of({ data: { risk_score: 44, flags: [] } }),
    );

    await expect(
      service.analyzeJournal({
        description: 'Admin test journal',
        debit: 100,
        credit: 100,
        reference: 'REF-1',
      }),
    ).resolves.toEqual({ risk_score: 44, flags: [] });

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/analyze-journal',
      expect.objectContaining({ reference: 'REF-1' }),
      undefined,
    );
  });

  it('posts copilot RAG requests to the dedicated engine route', async () => {
    (httpService.post as jest.Mock).mockReturnValue(of({ data: { reply: 'summary' } }));

    await expect(
      service.runCopilotRag({
        role: 'MANAGER',
        message: 'Summarize',
        context: 'Stable business',
        history: [],
      }),
    ).resolves.toEqual({ reply: 'summary' });

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/copilot/rag',
      expect.objectContaining({ role: 'MANAGER' }),
      undefined,
    );
  });

  it('throws when OCR extraction is called without a file', async () => {
    await expect(service.extractWithAI(undefined as never)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('forwards OCR uploads as multipart form data', async () => {
    (httpService.post as jest.Mock).mockReturnValue(of({ data: { text: 'invoice' } }));

    const file = {
      buffer: Buffer.from('sample'),
      originalname: 'invoice.pdf',
      mimetype: 'application/pdf',
    };

    await expect(service.extractWithAI(file as any)).resolves.toEqual({ text: 'invoice' });

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/extract-document',
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'content-type': expect.stringContaining('multipart/form-data'),
        }),
      }),
    );
  });

  it('wraps engine transport failures in an internal server exception', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (httpService.post as jest.Mock).mockReturnValue(
      throwError(() => new Error('network down')),
    );

    await expect(
      service.predictForecast({
        historical_data: [],
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
