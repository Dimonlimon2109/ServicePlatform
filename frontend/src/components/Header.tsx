import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";

const Header = () => {
    const navigate = useNavigate();
    const handleLogin = () => navigate('/login');
    const handleRegister = () => navigate('/register');
    const handleLogout = () => {
        axios.post('auth/logout', localStorage.accessToken).then(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userType');
            navigate('/');
        });
    };

    const isAuthenticated = Boolean(localStorage.accessToken);
    const userType = localStorage.userType;

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
                    {userType === 'ADMIN' && (
                        <Button color="inherit" onClick={() => navigate('/users')}>
                            Пользователи
                        </Button>
                    )}
                        <Button color="inherit" onClick={() => navigate('/services/my')}>
                            Мои услуги
                        </Button>
                    {isAuthenticated && (
                        <Button color="inherit" onClick={() => navigate('/bookings')}>
                            Бронирования
                        </Button>
                    )}
                        <Button color="inherit" onClick={() => navigate('/favorites')}>
                            Избранное
                        </Button>
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
