import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: 'http://localhost:3000',
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

        // Показываем ошибки, если это не 401
        if (error.response?.status !== 401) {
            if (error.response?.data?.Errors) {
                error.response.data.Errors.forEach((err: { ErrorMessage: string }) => {
                    toast.error(err.ErrorMessage);
                });
            } else {
                toast.error('Произошла ошибка при выполнении запроса');
            }

            return Promise.reject(error);
        }

        // === Обработка 401 и обновление токена ===
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const accessToken = localStorage.getItem('accessToken');

                const response = await axios.post('http://localhost:3000/auth/refresh', {
                    accessToken,
                    refreshToken,
                });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // Сохраняем новые токены
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Повторный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return instance(originalRequest);
            } catch (refreshError) {
                console.error('Ошибка обновления токена:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
