import { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ServiceCard from '../components/ServiceCard';
import {useAuth} from "../hooks/useAuth.ts";
import axios from "../api/axiosInstance.ts";

interface Favorite {
    id: string;
    service: {
        id: string;
        title: string;
        description: string;
        price: number;
        category: string;
        photoPath: string;
        duration: number;
        rating: number;
        provider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
}

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {user} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const favoritesRes = await axios.get(`/favorites/${user?.id}`);
                setFavorites(favoritesRes.data);
                console.log(favorites);
            } catch (err) {
                setError('Ошибка загрузки избранного');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleFavoriteToggle = async (serviceId: string) => {
        try {
            console.log(serviceId);
            await axios.delete(`/favorites/${serviceId}`);
            setFavorites(prev => prev.filter(f => f.service.id !== serviceId));
        } catch (err) {
            console.error('Ошибка удаления:', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <FavoriteBorderIcon fontSize="large" />
                Избранные услуги
            </Typography>

            {favorites.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2
                }}>
                    <Typography variant="h6" gutterBottom>
                        В избранном пока ничего нет
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {favorites.map((favorite) => (
                        <Grid item key={favorite.id} xs={12} sm={6} md={4}>
                            <ServiceCard
                                service={{
                                    id: favorite.service.id,
                                    title: favorite.service.title,
                                    description: favorite.service.description,
                                    price: favorite.service.price,
                                    rating: favorite.service.rating,
                                    photoPath: favorite.service.photoPath,
                                    providerId: favorite.service.provider.id
                                }}
                                isFavorite={true}
                                onFavoriteToggle={handleFavoriteToggle}
                                currentUserId={user?.id}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default FavoritesPage;