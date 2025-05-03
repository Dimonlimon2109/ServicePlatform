import { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import axios from '../api/axiosInstance.ts';
import {useParams} from "react-router-dom";

export default function Profile() {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
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

    if (loading) return <CircularProgress />;
    if (!profile) return <Typography>Профиль не найден</Typography>;

    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar src={profile.profilePhotoPath} sx={{ width: 100, height: 100 }} />
            <Typography variant="h5">{profile.firstName} {profile.lastName}</Typography>
            <Typography>Email: {profile.email}</Typography>
            <Typography>Телефон: {profile.phone}</Typography>
            <Typography>Роль: {profile.userType}</Typography>
        </Box>
    );
}
