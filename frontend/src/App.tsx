import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { useDispatch } from 'react-redux';
import {useEffect} from "react";
import {login, logout} from "./redux/authSlice.ts";

function App() {
    const dispatch = useDispatch();

    // Загрузка токенов из localStorage при старте приложения
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            dispatch(login({ accessToken, refreshToken }));
        }
    }, [dispatch]);

    // Функция проверки и обновления accessToken, если он истёк
    useEffect(() => {
        const checkAndRefreshToken = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            if (!accessToken || !refreshToken) return;

            try {
                // Симуляция вызова защищённого API, который требует валидный токен
                const response = await fetch('/api/protected-route', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                // Если доступ запрещён, значит токен может быть просрочен
                if (response.status === 401) {
                    const refreshResponse = await fetch('/api/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        // Получаем новый accessToken
                        const { newAccessToken } = await refreshResponse.json();
                        localStorage.setItem('accessToken', newAccessToken);
                        dispatch(login({ accessToken: newAccessToken, refreshToken }));
                    } else {
                        // Если обновление не удалось, выполняем logout
                        dispatch(logout());
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки токена:', error);
            }
        };

        // Можно вызывать эту функцию периодически, здесь – при монтировании компонента
        checkAndRefreshToken();
    }, [dispatch]);

    return (
        <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
        </BrowserRouter>
    );
}

export default App;
