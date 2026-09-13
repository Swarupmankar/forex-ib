export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/auth/ib-login',
    REFRESH: '/users/auth/refresh',
    LOGOUT: '/users/auth/logout',
  },
  USERS: {
    ME: '/users/me',
  },
} as const;
