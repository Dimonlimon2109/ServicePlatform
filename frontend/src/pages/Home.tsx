import { Box, Typography } from '@mui/material';
import Header from '../components/Header';

const Home = () => {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />

            {/* Основная часть */}
            <Box component="main" flexGrow={1} p={4}>
                <Typography variant="h4" align="center" color="textSecondary">
                    Добро пожаловать!
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" mt={2}>
                    Здесь будет основное содержимое страницы.
                </Typography>
            </Box>

            {/* Подвал */}
            <Box component="footer" p={2} textAlign="center" bgcolor="primary.main" color="white">
                &copy; {new Date().getFullYear()} Мой сервис
            </Box>
        </Box>
    );
};

export default Home;
