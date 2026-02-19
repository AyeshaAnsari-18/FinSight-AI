import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

export const UserRole = {
  ACCOUNTANT: 'ACCOUNTANT',
  AUDITOR: 'AUDITOR',
  COMPLIANCE: 'COMPLIANCE',
  MANAGER: 'MANAGER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

interface CustomJwtPayload extends JwtPayload {
  email: string;
  role: UserRole;
  sub: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
    },
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      Cookies.remove('refreshToken');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logOut, setLoading } = authSlice.actions;
export default authSlice.reducer;


function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

export const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);

    if (!decoded.sub || !decoded.email || !isUserRole(decoded.role)) {
      console.warn("Invalid token structure or unknown role");
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (e) {
    console.error("Error in decode token:", e);
    return null;
  }
};