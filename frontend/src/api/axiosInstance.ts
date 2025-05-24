import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// === REQUEST INTERCEPTOR ===
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log(originalRequest.url);
        const isLoginRequest = originalRequest.url?.includes('/auth/login');
        const isUserMeRequest = originalRequest.url?.includes('/users/profile/me');

        if (error.response?.status === 401 && !isLoginRequest && !originalRequest._retry) {
            if (originalRequest.url.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken && !isUserMeRequest) {
                console.log("qqqq");
                console.log(originalRequest.url);
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post('http://localhost:3000/auth/refresh', {
                    refreshToken,
                });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return instance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                const currentPath = window.location.pathname;
                const isServiceDetailPage = /^\/services\/[^/]+$/.test(currentPath);

                if (!isServiceDetailPage) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.data?.Errors) {
            error.response.data.Errors.forEach((err:{ErrorMessage:string}) => {
                toast.error(err.ErrorMessage);
            });
        }

        return Promise.reject(error);
    }
);

export default instance;
