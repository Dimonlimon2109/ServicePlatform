import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {authLogin} from '../api/authApi.ts';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await authLogin({ email, password });
            const { accessToken, refreshToken } = response.data;

            // Сохраняем токены в Redux
            dispatch(login({ accessToken, refreshToken }));

            navigate('/');
        } catch (error) {
            console.error('Ошибка авторизации', error);
        }
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Войти в аккаунт</Typography>
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
    );
};

export default Login;
