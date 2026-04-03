export const BASE_URL = import.meta.env.VITE_BASE_URL;
//export const BASE_URL = 'http://localhost:8080'
export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    OAUTH: "oauth2/authorization/google",
  },
  USER: {
    ME: '/user/me',  
    ADD_CF_HANDLE: '/user/add-cf',
  },
  MATCH: {
    CREATE: '/api/match/create',
    JOIN: '/api/match/join',
    START: '/api/match/start',
    STATUS: '/api/match/status',
  },
  DEBUG: {
    ACTIVE_MATCHES: '/test',
  },
};