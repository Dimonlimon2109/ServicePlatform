import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const handleLogin = () => navigate('/login');
    const handleRegister = () => navigate('/register');
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        navigate('/');
    };

    return (
        <AppBar position="static">
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
                    <Button color="inherit" onClick={() => navigate('/catalog')}>
                        Каталог
                    </Button>
                    {localStorage.userType === 'ADMIN' && (
                        <Button color="inherit" onClick={() => navigate('/users')}>
                            Пользователи
                        </Button>
                    )}
                </Box>
                <Box>
                    {!localStorage.accessToken ? (
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
