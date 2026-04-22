import { EngineController } from './engine.controller';

describe('EngineController', () => {
  const engineService = {
    analyzeJournal: jest.fn(),
    analyzeReconciliation: jest.fn(),
    orchestrateFiscalClose: jest.fn(),
    predictForecast: jest.fn(),
    predictWhatIf: jest.fn(),
    runCopilotRag: jest.fn(),
    extractWithAI: jest.fn(),
  };

  let controller: EngineController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EngineController(engineService as any);
  });

  it('delegates journal analysis requests', async () => {
    engineService.analyzeJournal.mockResolvedValue({ risk_score: 22 });

    await expect(controller.analyzeJournal({ reference: 'REF-1' })).resolves.toEqual({
      risk_score: 22,
    });
    expect(engineService.analyzeJournal).toHaveBeenCalledWith({ reference: 'REF-1' });
  });

  it('delegates reconciliation analysis requests', async () => {
    engineService.analyzeReconciliation.mockResolvedValue({ matched: false });

    await expect(controller.analyzeReconciliation({ bank_balance: 1 })).resolves.toEqual({
      matched: false,
    });
  });

  it('delegates OCR uploads', async () => {
    const file = { originalname: 'invoice.pdf' };
    engineService.extractWithAI.mockResolvedValue({ summary: 'done' });

    await expect(controller.uploadDocumentForOCR(file as any)).resolves.toEqual({
      summary: 'done',
    });
    expect(engineService.extractWithAI).toHaveBeenCalledWith(file);
  });
});
