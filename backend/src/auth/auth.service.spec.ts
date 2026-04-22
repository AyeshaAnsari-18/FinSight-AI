import { ForbiddenException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_AT_SECRET') return 'at-secret';
      if (key === 'JWT_RT_SECRET') return 'rt-secret';
      return undefined;
    }),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as any, jwtService as any, config as any);
  });

  it('creates access and refresh tokens with the configured secrets', async () => {
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(service.getTokens('user-1', 'user@example.com', 'MANAGER')).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: 'user-1', email: 'user@example.com', role: 'MANAGER' },
      { secret: 'at-secret', expiresIn: '15m' },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: 'user-1', email: 'user@example.com', role: 'MANAGER' },
      { secret: 'rt-secret', expiresIn: '7d' },
    );
  });

  it('signs in a user when the password is valid', async () => {
    const password = 'password123';
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: await argon2.hash(password),
      role: 'AUDITOR',
    });

    jest
      .spyOn(service, 'getTokens')
      .mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });
    jest.spyOn(service, 'updateRtHash').mockResolvedValue(undefined);

    await expect(
      service.signinLocal({
        email: 'user@example.com',
        password,
      } as any),
    ).resolves.toEqual({ access_token: 'at', refresh_token: 'rt' });

    expect(service.getTokens).toHaveBeenCalledWith('user-1', 'user@example.com', 'AUDITOR');
    expect(service.updateRtHash).toHaveBeenCalledWith('user-1', 'rt');
  });

  it('rejects a refresh request when the provided token does not match the stored hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'MANAGER',
      hashedRefreshToken: await argon2.hash('stored-token'),
    });

    await expect(service.refreshTokens('user-1', 'different-token')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('clears the refresh token hash during logout', async () => {
    prisma.user.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.logout('user-1')).resolves.toBeUndefined();
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });
  });
});
