import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    signupLocal: jest.fn(),
    signinLocal: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as any);
  });

  it('delegates signup requests to the auth service', async () => {
    const dto = {
      name: 'Ana Accountant',
      email: 'ana@example.com',
      password: 'password123',
      role: 'ACCOUNTANT' as const,
    };

    authService.signupLocal.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });

    await expect(controller.signup(dto)).resolves.toEqual({
      access_token: 'at',
      refresh_token: 'rt',
    });
    expect(authService.signupLocal).toHaveBeenCalledWith(dto);
  });

  it('delegates signin requests to the auth service', async () => {
    const dto = {
      email: 'manager@example.com',
      password: 'password123',
    };

    authService.signinLocal.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });

    await expect(controller.signin(dto as any)).resolves.toEqual({
      access_token: 'at',
      refresh_token: 'rt',
    });
    expect(authService.signinLocal).toHaveBeenCalledWith(dto);
  });

  it('delegates logout using the current user id', async () => {
    authService.logout.mockResolvedValue(undefined);

    await expect(controller.logout('user-1')).resolves.toBeUndefined();
    expect(authService.logout).toHaveBeenCalledWith('user-1');
  });

  it('delegates refresh requests with the extracted refresh token', async () => {
    authService.refreshTokens.mockResolvedValue({ access_token: 'next-at', refresh_token: 'next-rt' });

    await expect(controller.refreshTokens('user-1', 'refresh-token')).resolves.toEqual({
      access_token: 'next-at',
      refresh_token: 'next-rt',
    });
    expect(authService.refreshTokens).toHaveBeenCalledWith('user-1', 'refresh-token');
  });
});
