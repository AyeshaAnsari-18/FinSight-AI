import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const prisma = {
    journalEntry: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
  };

  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardService(prisma as any);
  });

  it('calculates accountant KPIs and alert severity from database results', async () => {
    prisma.journalEntry.groupBy.mockResolvedValue([
      { status: 'DRAFT', _count: { status: 4 } },
      { status: 'FLAGGED', _count: { status: 2 } },
    ]);
    prisma.task.findMany.mockResolvedValue([
      { title: 'Accrual review' },
      { title: 'GST filing' },
      { title: 'Close checklist' },
    ]);
    prisma.journalEntry.findMany.mockResolvedValue([
      {
        id: 'journal-1',
        description: 'Late accrual',
        riskScore: 88,
        flagReason: 'Amount mismatch',
      },
      {
        id: 'journal-2',
        description: 'Sales entry',
        riskScore: 64,
        flagReason: 'Reference missing',
      },
    ]);

    await expect(service.getAccountantMetrics('user-1')).resolves.toEqual({
      kpi: {
        totalPendingTasks: 3,
        accrualTasks: 1,
        taxTasks: 1,
        pendingJournals: 4,
        validationFailures: 2,
        bankReconciliations: 3,
        vendorReconciliations: 5,
      },
      alerts: [
        {
          id: 'journal-1',
          message: 'Late accrual: Amount mismatch',
          severity: 'high',
        },
        {
          id: 'journal-2',
          message: 'Sales entry: Reference missing',
          severity: 'medium',
        },
      ],
    });
  });
});
