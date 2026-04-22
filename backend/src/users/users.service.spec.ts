import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as any);
  });

  it('returns a user without password fields', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'manager@example.com',
      role: 'MANAGER',
      password: 'secret',
      hashedRefreshToken: 'refresh',
      name: 'Manager Mia',
    });

    await expect(service.findOne('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'manager@example.com',
      role: 'MANAGER',
      name: 'Manager Mia',
    });
  });

  it('throws when the requested user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('hashes a new password during update and omits secrets from the response', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'auditor@example.com',
      role: 'AUDITOR',
      name: 'Updated Auditor',
      password: 'hashed-secret',
      hashedRefreshToken: 'hashed-refresh',
    });

    const result = await service.update('user-1', {
      name: 'Updated Auditor',
      password: 'password123',
    });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          name: 'Updated Auditor',
          password: expect.any(String),
        }),
      }),
    );
    expect(result).toEqual({
      id: 'user-1',
      email: 'auditor@example.com',
      role: 'AUDITOR',
      name: 'Updated Auditor',
    });
  });

  it('formats grouped roles into department cards', async () => {
    prisma.user.groupBy.mockResolvedValue([
      { role: 'ADMIN', _count: { id: 1 } },
      { role: 'AUDITOR', _count: { id: 3 } },
    ]);

    await expect(service.groupByRole()).resolves.toEqual([
      {
        id: 1,
        name: 'Admin Department',
        head: 'System Admin',
        employees: 1,
      },
      {
        id: 2,
        name: 'Auditor Department',
        head: 'Manager',
        employees: 3,
      },
    ]);
  });
});
