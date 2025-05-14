import { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress, Button } from '@mui/material';
import axios from '../api/axiosInstance.ts';
import { useNavigate, useParams } from 'react-router-dom';

export default function Profile() {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const endpoint = id ? `/users/${id}` : `/users/profile/me`;
                const res = await axios.get(endpoint);
                setProfile(res.data);
            } catch (e) {
                console.error('Ошибка получения профиля:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleBlockToggle = async () => {
        if (!profile || !id) return;

        setActionLoading(true);
        try {
            // Если isBlocked === true — разблокировать, иначе заблокировать
            const endpoint = `/users/${id}/${profile.isBlocked ? 'unblock' : 'block'}`;
            await axios.put(endpoint);

            // Обновляем профиль
            const res = await axios.get(`/users/${id}`);
            setProfile(res.data);
        } catch (e) {
            console.error('Ошибка при изменении блокировки:', e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!profile || !id) return;

        setActionLoading(true);
        try {
            await axios.delete(`/users/${id}`);
            navigate('/');
        } catch (e) {
            console.error('Ошибка при удалении пользователя:', e);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (!profile) return <Typography>Профиль не найден</Typography>;

    const canBlockOrUnblock = id && localStorage.userType === 'ADMIN' && typeof profile.isBlocked === 'boolean';
    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar src={profile.profilePhotoPath} sx={{ width: 100, height: 100 }} />
            <Typography variant="h5">{profile.firstName} {profile.lastName}</Typography>
            <Typography>Email: {profile.email}</Typography>
            <Typography>Телефон: {profile.phone}</Typography>

            {id && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/chat/${id}`)}
                    disabled={actionLoading}
                >
                    Написать сообщение
                </Button>
            )}

            {canBlockOrUnblock && (
                <Button
                    variant="contained"
                    color={profile.isBlocked ? 'success' : 'error'}
                    onClick={handleBlockToggle}
                    disabled={actionLoading}
                >
                    {profile.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                </Button>
            )}

            {/*/!* Если isBlocked отсутствует — показываем кнопку удалить *!/*/}
            {/*{localStorage.userType === 'ADMIN' && id && (*/}
            {/*    <Button*/}
            {/*        variant="outlined"*/}
            {/*        color="error"*/}
            {/*        onClick={handleDelete}*/}
            {/*        disabled={actionLoading}*/}
            {/*    >*/}
            {/*        Удалить пользователя*/}
            {/*    </Button>*/}
            {/*)}*/}

            {profile.userType === 'ADMIN' && (
                <Typography>Роль: {profile.userType}</Typography>
            )}
        </Box>
    );
}
