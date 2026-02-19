import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '../store/store';
import { logOut, setCredentials, decodeToken } from '../store/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Your NestJS Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post('http://localhost:3000/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const user = decodeToken(data.access_token);
          if (user) {
            store.dispatch(setCredentials({
              user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token
            }));

            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log("/refresh token error: ", refreshError);
          store.dispatch(logOut());
          window.location.href = '/login';
        }
      } else {
        store.dispatch(logOut());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;