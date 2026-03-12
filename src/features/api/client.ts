import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL - environment variable yoki default
const BASE_URL = 'http://localhost:3000';

// Axios instance yaratish
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har bir requestga token qo'shish
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // LocalStorage dan token olish
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - token muddati tugagan
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token bilan yangi access token olish
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // Yangi tokenni saqlash
          localStorage.setItem('accessToken', data.accessToken);

          // Original requestni qayta yuborish
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token ham ishlamasa, logout qilish
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - ruxsat yo'q
    if (error.response?.status === 403) {
      console.error('Ruxsat yo\'q!');
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('Topilmadi!');
    }

    // 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server xatosi!');
    }

    return Promise.reject(error);
  }
);

export default apiClient;