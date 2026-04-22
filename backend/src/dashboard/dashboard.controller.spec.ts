import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  const dashboardService = {
    getAccountantMetrics: jest.fn(),
  };

  let controller: DashboardController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DashboardController(dashboardService as any);
  });

  it('returns accountant metrics for the current user', async () => {
    dashboardService.getAccountantMetrics.mockResolvedValue({ kpi: { totalPendingTasks: 3 } });

    await expect(controller.getAccountantStats('user-1')).resolves.toEqual({
      kpi: { totalPendingTasks: 3 },
    });
    expect(dashboardService.getAccountantMetrics).toHaveBeenCalledWith('user-1');
  });
});
