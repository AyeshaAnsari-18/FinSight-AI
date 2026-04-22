import * as argon2 from 'argon2';
import { ForbiddenException } from '@nestjs/common';
import { AdminTestService } from './admin-test.service';

describe('AdminTestService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
    },
    adminTestReport: {
      findMany: jest.fn(),
    },
  };

  const authService = {
    getTokens: jest.fn(),
    updateRtHash: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  let service: AdminTestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminTestService(prisma as any, authService as any, configService as any);
  });

  it('rejects non-admin usernames before reading the database', async () => {
    await expect(
      service.login({ username: 'manager', password: 'admin' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('returns tokens for the seeded admin user when the password matches', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@finsight.ai',
      name: 'admin',
      role: 'ADMIN',
      password: await argon2.hash('admin'),
    });
    authService.getTokens.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    });
    authService.updateRtHash.mockResolvedValue(undefined);

    await expect(service.login({ username: 'admin', password: 'admin' })).resolves.toEqual({
      access_token: 'at',
      refresh_token: 'rt',
      user: {
        id: 'admin-1',
        email: 'admin@finsight.ai',
        name: 'admin',
        role: 'ADMIN',
      },
    });
  });

  it('publishes suites that include the new journal and reconciliation analyze flows', () => {
    const catalog = service.getCatalog();
    const accountantSuite = catalog.find((suite) => suite.id === 'accountant-ops');
    const managerSuite = catalog.find((suite) => suite.id === 'manager-ai');

    expect(accountantSuite?.cases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/journals/analyze', ai: true }),
        expect.objectContaining({ path: '/journals/:id/analyze', ai: true }),
        expect.objectContaining({ path: '/reconcile/analyze', ai: true }),
        expect.objectContaining({ path: '/reconcile/:id/analyze', ai: true }),
      ]),
    );
    expect(managerSuite?.cases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/engine/upload-ocr', ai: true }),
        expect.objectContaining({ path: '/engine/copilot-rag', ai: true }),
      ]),
    );
  });

  it('serializes report timestamps when listing saved reports', async () => {
    prisma.adminTestReport.findMany.mockResolvedValue([
      {
        id: 'report-1',
        title: 'Nightly safe sweep',
        status: 'PASSED',
        mode: 'SAFE',
        includeAi: false,
        summary: { passed: 8 },
        results: [],
        startedAt: new Date('2026-04-22T10:00:00.000Z'),
        finishedAt: new Date('2026-04-22T10:02:00.000Z'),
        pdfPath: 'D:/reports/report-1.pdf',
        reportUrl: '/admin-test/reports/report-1/download',
        createdBy: 'admin@finsight.ai',
        createdAt: new Date('2026-04-22T10:02:00.000Z'),
        updatedAt: new Date('2026-04-22T10:02:00.000Z'),
      },
    ]);

    await expect(service.listReports()).resolves.toEqual([
      expect.objectContaining({
        id: 'report-1',
        startedAt: '2026-04-22T10:00:00.000Z',
        finishedAt: '2026-04-22T10:02:00.000Z',
        createdAt: '2026-04-22T10:02:00.000Z',
      }),
    ]);
  });
});
