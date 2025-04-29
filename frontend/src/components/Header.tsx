import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated } from '../redux/authSlice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    Главная
                </Typography>
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
                        <Button color="inherit" onClick={handleLogout}>
                            Выйти
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
