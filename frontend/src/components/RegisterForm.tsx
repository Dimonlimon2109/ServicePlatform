import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';  // Импортируем действия из authSlice
import { authRegister } from '../api/authApi';
import {useNavigate} from "react-router-dom";  // Импортируем функцию для регистрации

export default function RegisterForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Пытаемся зарегистрировать пользователя
            const response = await authRegister({ ...form, avatar: avatar! });
            console.log('Успешная регистрация:', response.data);

            // После успешной регистрации выполняем вход и обновляем состояние Redux
            const { accessToken, refreshToken } = response.data;
            dispatch(login({ accessToken, refreshToken }));
            navigate('/login');
            // Здесь можно перенаправить пользователя или отобразить сообщение об успехе
        } catch (error) {
            setError('Ошибка регистрации: Неверные данные или серверная ошибка');
            console.error('Ошибка регистрации:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5">Регистрация</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
            />
            <TextField
                label="Пароль"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
            />
            <TextField
                label="Имя"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
            />
            <TextField
                label="Фамилия"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
            />
            <TextField
                label="Телефон"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
            />
            <Button variant="contained" component="label">
                Загрузить аватар
                <input type="file" hidden onChange={handleAvatarChange} />
            </Button>
            <Button type="submit" variant="contained">Зарегистрироваться</Button>
        </Box>
    );
}
