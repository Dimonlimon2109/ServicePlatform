import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";
import {useAuth} from "../hooks/useAuth.ts";

const Header = () => {
    const navigate = useNavigate();
    const {user} = useAuth();

    const handleLogin = () => navigate('/login');
    const handleRegister = () => navigate('/register');
    const handleLogout = () => {
        axios.post('auth/logout', localStorage.accessToken).then(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/');
        });
    };

    const isAuthenticated = Boolean(localStorage.accessToken);

    return (
        <AppBar position="sticky">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Главная
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/')}>
                        Каталог
                    </Button>
                    {user?.userType === 'ADMIN' && (
                        <Button color="inherit" onClick={() => navigate('/users')}>
                            Пользователи
                        </Button>
                    )}
                    {user?.userType === 'USER' && (
                        <Button color="inherit" onClick={() => navigate('/services/my')}>
                            Мои услуги
                        </Button>
                    )}
                    {user?.userType === 'USER' && (
                        <Button color="inherit" onClick={() => navigate('/bookings')}>
                            Бронирования
                        </Button>
                    )}
                    {user?.userType === 'USER' && (
                        <Button color="inherit" onClick={() => navigate('/favorites')}>
                            Избранное
                        </Button>
                        )}
                </Box>
                <Box>
                    {!isAuthenticated ? (
                        <>
                            <Button color="inherit" onClick={handleLogin}>
                                Войти
                            </Button>
                            <Button color="inherit" onClick={handleRegister}>
                                Зарегистрироваться
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/profile')}>
                                Профиль
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
