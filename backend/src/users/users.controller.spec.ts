import { UsersController } from './users.controller';

describe('UsersController', () => {
  const usersService = {
    findOne: jest.fn(),
    update: jest.fn(),
    groupByRole: jest.fn(),
  };

  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(usersService as any);
  });

  it('returns the current user profile', async () => {
    usersService.findOne.mockResolvedValue({ id: 'user-1', email: 'auditor@example.com' });

    await expect(controller.getMe('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'auditor@example.com',
    });
  });

  it('updates the current user profile', async () => {
    usersService.update.mockResolvedValue({ id: 'user-1', name: 'Updated Name' });

    await expect(controller.updateMe('user-1', { name: 'Updated Name' })).resolves.toEqual({
      id: 'user-1',
      name: 'Updated Name',
    });
    expect(usersService.update).toHaveBeenCalledWith('user-1', { name: 'Updated Name' });
  });

  it('returns the department overview derived from roles', async () => {
    usersService.groupByRole.mockResolvedValue([{ id: 1, name: 'Auditor Department' }]);

    await expect(controller.getDepartmentsOverview()).resolves.toEqual([
      { id: 1, name: 'Auditor Department' },
    ]);
  });
});
