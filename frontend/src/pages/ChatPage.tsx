import { useParams } from 'react-router-dom';
import ChatComponent from '../components/ChatComponent';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    // другие поля при необходимости
}

const ChatPage = () => {
    const { id } = useParams(); // ID собеседника
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`/users/${id}`);
                setUser(res.data);
            } catch (error) {
                console.error('Ошибка при получении пользователя:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom mt={4}>
                Чат с {user?.firstName} {user?.lastName}
            </Typography>
            <ChatComponent receiverId={id!} />
        </Container>
    );
};

export default ChatPage;
