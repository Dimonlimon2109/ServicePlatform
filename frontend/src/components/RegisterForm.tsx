import { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from '../api/axiosInstance.ts';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAvatar(e.target.files[0]);
        }
    };

    const validateForm = () => {

        if (form.firstName.trim() === '' || form.lastName.trim() === '') {
            toast.error('Введите имя или фамилию');
            return false;
        }

        if (form.password.length < 6 || form.password.length > 64) {
            toast.error('Пароль должен содержать от 6 до 64 символов');
            return false;
        }

        // Валидация телефона
        const phonePattern = /^\+375(25|29|33|44)\d{7}$/;
        if (!phonePattern.test(form.phone)) {
            toast.error('Телефон должен быть в формате +375 (25|29|33|44)XXXXXXX');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!avatar) {
            toast.error('Пожалуйста, загрузите аватар перед регистрацией.');
            return;
        }

        if (!validateForm()) return;

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('avatar', avatar);

            const response = await axios.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Регистрация прошла успешно!');
            navigate('/login');
        } catch (error: any) {
            if (error.response?.status === 409)
            {
                toast.error('Email уже используется');
            }
            else
            {
                toast.error('Ошибка регистрации: Неверные данные или серверная ошибка');
                console.error('Ошибка регистрации:', error);
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                }}
            >
                <Typography variant="h5" align="center">Регистрация</Typography>

                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Пароль"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="Пароль должен содержать от 6 до 64 символов"
                />
                <TextField
                    label="Имя"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Фамилия"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Телефон"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="Формат: +375 (25|29|33|44)XXXXXXX"
                />

                <Button variant="contained" component="label">
                    Загрузить аватар
                    <input
                        type="file"
                        hidden
                        onChange={handleAvatarChange}
                        accept="image/*"
                    />
                </Button>

                {avatar && (
                    <Typography variant="body2">
                        Выбран файл: {avatar.name}
                    </Typography>
                )}

                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Зарегистрироваться
                </Button>
            </Box>
        </Container>
    );
}