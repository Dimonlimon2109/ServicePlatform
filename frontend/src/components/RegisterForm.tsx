import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from '../api/axiosInstance.ts';

export default function RegisterForm() {
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
        if (e.target.files && e.target.files.length > 0) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Создаем объект FormData
            const formData = new FormData();

            // Добавляем текстовые поля формы
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Добавляем файл аватара, если он есть
            if (avatar) {
                formData.append('avatar', avatar);
            }

            // Отправляем запрос с правильным Content-Type
            const response = await axios.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Успешная регистрация:', response.data);
            navigate('/login');
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
                type="email"
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
                <input
                    type="file"
                    hidden
                    onChange={handleAvatarChange}
                    accept="image/*" // Ограничиваем выбор только изображениями
                />
            </Button>
            {avatar && (
                <Typography variant="body2">
                    Выбран файл: {avatar.name}
                </Typography>
            )}
            <Button type="submit" variant="contained" color="primary">
                Зарегистрироваться
            </Button>
        </Box>
    );
}
