import { ForbiddenException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { AdminTestController } from './admin-test.controller';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('AdminTestController', () => {
  const adminTestService = {
    login: jest.fn(),
    getCatalog: jest.fn(),
    runTests: jest.fn(),
    listReports: jest.fn(),
    getReport: jest.fn(),
    getReportFile: jest.fn(),
  };

  let controller: AdminTestController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminTestController(adminTestService as any);
  });

  it('allows admin login requests through without an auth guard dependency', async () => {
    adminTestService.login.mockResolvedValue({ access_token: 'token' });

    await expect(controller.login({ username: 'admin', password: 'admin' })).resolves.toEqual({
      access_token: 'token',
    });
  });

  it('blocks catalog access for non-admin roles', () => {
    expect(() => controller.getCatalog('MANAGER')).toThrow(ForbiddenException);
  });

  it('runs test sweeps for admins', async () => {
    adminTestService.runTests.mockResolvedValue({ id: 'report-1' });

    await expect(
      controller.runTests({ suiteIds: ['public-core'], includeAi: false }, 'ADMIN', 'admin@finsight.ai'),
    ).resolves.toEqual({ id: 'report-1' });
    expect(adminTestService.runTests).toHaveBeenCalledWith(
      { suiteIds: ['public-core'], includeAi: false },
      'admin@finsight.ai',
    );
  });

  it('downloads reports through the express response object', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    adminTestService.getReportFile.mockResolvedValue({
      filePath: 'D:/fahad/FinSight-AI/backend/storage/report.pdf',
      fileName: 'report.pdf',
    });
    (readFile as jest.Mock).mockResolvedValue(Buffer.from('report-bytes'));

    await controller.downloadReport('report-1', 'ADMIN', res as any);

    expect(readFile).toHaveBeenCalledWith(
      'D:/fahad/FinSight-AI/backend/storage/report.pdf',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.any(Buffer),
    );
  });
});
