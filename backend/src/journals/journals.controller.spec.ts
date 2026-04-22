import { JournalsController } from './journals.controller';

describe('JournalsController', () => {
  const journalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    reviewSummary: jest.fn(),
    analyzeDraft: jest.fn(),
    reanalyze: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  let controller: JournalsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new JournalsController(journalsService as any);
  });

  it('creates journal entries through the service', async () => {
    journalsService.create.mockResolvedValue({ id: 'journal-1' });

    await expect(controller.create({ reference: 'REF-1' } as any)).resolves.toEqual({
      id: 'journal-1',
    });
  });

  it('returns review summaries for the auditor workflow', async () => {
    journalsService.reviewSummary.mockResolvedValue({ summary: { totalEntries: 3 } });

    await expect(controller.reviewSummary({ scope: 'currentYear' } as any)).resolves.toEqual({
      summary: { totalEntries: 3 },
    });
  });

  it('supports draft analysis and single-entry reanalysis', async () => {
    journalsService.analyzeDraft.mockResolvedValue({ riskScore: 51 });
    journalsService.reanalyze.mockResolvedValue({ analysis: { riskScore: 88 } });

    await expect(controller.analyze({ reference: 'REF-1' } as any)).resolves.toEqual({
      riskScore: 51,
    });
    await expect(controller.analyzeOne('journal-1')).resolves.toEqual({
      analysis: { riskScore: 88 },
    });
  });
});
