import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance.ts';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`/auth/login`, { email, password });
            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            navigate('/');
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Ваш аккаунт заблокирован. Обратитесь в поддержку.');
            } else if (error.response?.status === 404) {
                toast.error('Пользователь не найден');
            } else if (error.response?.status === 400) {
                toast.error('Неверный пароль');
            } else {
                toast.error('Ошибка авторизации. Попробуйте снова.');
            }
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
        >
            <Box width="30%" minWidth={300}>
                <Typography variant="h4" gutterBottom textAlign="center">
                    Войти в аккаунт
                </Typography>

                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                />
                <TextField
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 2 }}
                >
                    Войти
                </Button>
            </Box>
        </Box>
    );
};

export default Login;
