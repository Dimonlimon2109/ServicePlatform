import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress, Card, CardMedia, Stack, Divider, Avatar
} from '@mui/material';
import axios from '../api/axiosInstance';
import BookingDialog from "./BookingDialog.tsx";
import {useAuth} from "../hooks/useAuth.ts";

export default function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);

    const [bookingOpen, setBookingOpen] = useState(false);
    const { user } = useAuth(); // получить userId из контекста/хука

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await axios.get(`/services/${id}`);
                setService(response.data);
                setReviews(response.data.reviews || []);
            } catch (error) {
                console.error('Ошибка при загрузке услуги:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (!service) {
        return (
            <Box p={4}>
                <Typography variant="h6" color="error">Услуга не найдена</Typography>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                <Card sx={{ width: { xs: '100%', md: 400 }, boxShadow: 3 }}>
                    {service.photoPath && (
                        <CardMedia
                            component="img"
                            height="300"
                            image={service.photoPath}
                            alt={service.name}
                        />
                    )}
                </Card>

                <Box flex={1}>
                    <Typography variant="h4" gutterBottom>
                        {service.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {service.description}
                    </Typography>

                    <Stack spacing={1} mt={2}>
                        <Typography>Категория: <strong>{service.category}</strong></Typography>
                        <Typography>Цена: <strong>{service.price} BYN</strong></Typography>
                        <Typography>Длительность: <strong>{service.duration} мин.</strong></Typography>
                        <Typography>Рейтинг: <strong>{service.rating ?? 'Нет оценки'}</strong></Typography>
                        <Typography>
                            Провайдер:{' '}
                            <Box
                                component="span"
                                sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                                onClick={() => navigate(`/users/${service.providerId}`)}
                            >
                                {service.provider?.firstName + ' ' + service.provider?.lastName}
                            </Box>
                        </Typography>
                    </Stack>

                    <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => setBookingOpen(true)}
                        >
                            Забронировать
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/chat/${service.providerId}`)}
                        >
                            Написать провайдеру
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* REVIEWS BLOCK */}
            <Box mt={6}>
                <Typography variant="h5" gutterBottom>Отзывы</Typography>
                <Divider sx={{ mb: 2 }} />
                {reviews.length === 0 ? (
                    <Typography color="text.secondary">Отзывов пока нет.</Typography>
                ) : (
                    reviews.map((review, index) => (
                        <Box key={index} mb={3} display="flex" gap={2}>
                            <Avatar
                                variant="square"
                                src={review.user?.profilePhotoPath || 'default.jpg'}
                                sx={{
                                    width: 128,              // можно изменить под нужный размер
                                    height: 128,
                                    borderRadius: 0,        // квадратная форма
                                    objectFit: 'cover'      // изображение не искажается
                                }}
                            />
                            <Box>
                                <Typography variant="subtitle2">
                                    {review.user?.firstName + review.user?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {review.comment}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Оценка: {review.rating}/5
                                </Typography>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
            <BookingDialog
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                serviceId={id!}
                userId={user?.id}
            />
        </Box>
    );
}
