import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress, Card, CardMedia, Stack, Divider, Avatar, Rating,
    Snackbar, Alert, Grid
} from '@mui/material';
import axios from '../api/axiosInstance';
import BookingDialog from "./BookingDialog";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatIcon from '@mui/icons-material/Chat';

export default function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [bookingOpen, setBookingOpen] = useState(false);
    const { user } = useAuth();

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

    const handleDeleteService = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить услугу?')) return;

        try {
            await axios.delete(`/services/${id}`);
            toast.success('Услуга успешно удалена');
            setTimeout(() => navigate('/catalog'), 2000);
        } catch (error) {
            toast.error('Ошибка при удалении услуги');
            console.error('Ошибка при удалении услуги:', error);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить отзыв?')) return;

        try {
            await axios.delete(`/reviews/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (error) {
            console.error(`Ошибка при удалении отзыва: ${error}`);
        }
    };

    const isCommonUser = user && service && user.id !== service.providerId;

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
        <Box p={4} sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert severity="success">{success}</Alert>
            </Snackbar>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Service Image */}
                <Card sx={{
                    width: { xs: '100%', md: 500 },
                    height: 'fit-content',
                    boxShadow: 3,
                    borderRadius: 4,
                    overflow: 'hidden'
                }}>
                    {service.photoPath && (
                        <CardMedia
                            component="img"
                            height="400"
                            image={service.photoPath}
                            alt={service.name}
                            sx={{ objectFit: 'cover' }}
                        />
                    )}
                </Card>

                {/* Service Info */}
                <Box flex={1} sx={{ position: 'relative' }}>
                    <Typography variant="h3" gutterBottom sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 3,
                        fontSize: { xs: '2rem', md: '2.5rem' }
                    }}>
                        {service.name}
                    </Typography>

                    <Typography variant="body1" paragraph sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: 'text.secondary',
                        mb: 4
                    }}>
                        {service.description}
                    </Typography>

                    {/* Info Card */}
                    <Card sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: 2,
                        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
                    }}>
                        <Grid container spacing={3}>
                            {/* Price */}
                            <Grid>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }}>
                                        Цена:
                                    </Typography>
                                    <Typography variant="h4" sx={{
                                        color: 'success.main',
                                        fontWeight: 700
                                    }}>
                                        {service.price} BYN
                                    </Typography>
                                </Stack>
                            </Grid>

                            <Grid>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }}>
                                        Длительность:
                                    </Typography>
                                    <Typography variant="h5" sx={{
                                        color: 'primary.main',
                                        fontWeight: 600
                                    }}>
                                        {service.duration} минут
                                    </Typography>
                                </Stack>
                            </Grid>

                            <Grid>
                                <Divider sx={{ my: 2 }} />
                            </Grid>

                            <Grid>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }}>
                                        Рейтинг:
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Rating
                                            value={service.rating}
                                            precision={0.5}
                                            readOnly
                                            size="large"
                                            sx={{ color: 'warning.main' }}
                                        />
                                        <Typography variant="h6">
                                            ({service.rating?.toFixed(1) || 'Нет оценок'})
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Provider */}
                            <Grid>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }}>
                                        Провайдер:
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/users/${service.providerId}`)}
                                    >
                                        <Avatar
                                            src={service.provider?.profilePhotoPath}
                                            sx={{ width: 48, height: 48 }}
                                        />
                                        <Typography variant="h6">
                                            {service.provider?.firstName} {service.provider?.lastName}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Action Buttons */}
                    <Box display="flex" gap={2} flexWrap="wrap" sx={{ mt: 4 }}>
                        {isCommonUser && (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<CalendarTodayIcon />}
                                    onClick={() => setBookingOpen(true)}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        '&:hover': { transform: 'translateY(-2px)' }
                                    }}>
                                    Забронировать
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    startIcon={<ChatIcon />}
                                    onClick={() => navigate(`/chat/${service.providerId}`)}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        '&:hover': { transform: 'translateY(-2px)' }
                                    }}>
                                    Написать
                                </Button>
                            </>
                        )}

                        {(user?.userType === 'ADMIN' || user?.id === service.providerId) && (
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                onClick={handleDeleteService}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1.1rem'
                                }}>
                                Удалить услугу
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Reviews Section */}
            <Box mt={6}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Отзывы
                </Typography>
                <Divider sx={{ mb: 4 }} />
                {reviews.length === 0 ? (
                    <Typography color="text.secondary" variant="body1">
                        Отзывов пока нет.
                    </Typography>
                ) : (
                    <Stack spacing={3}>
                        {reviews.map((review, index) => {
                            const isOwnReview = review.user?.id === user?.id;

                            return (
                                <Card
                                    key={index}
                                    sx={{
                                        p: 3,
                                        boxShadow: 2,
                                        position: 'relative',
                                        borderRadius: 3,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-3px)' }
                                    }}>
                                    <Box display="flex" gap={2}>
                                        <Avatar
                                            src={review.user?.profilePhotoPath}
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                objectFit: 'cover',
                                                border: '2px solid #eee'
                                            }}
                                        />
                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {review.user?.firstName} {review.user?.lastName}
                                            </Typography>
                                            <Rating
                                                value={review.rating}
                                                precision={0.5}
                                                readOnly
                                                size="medium"
                                                sx={{ color: 'warning.main', my: 1 }}
                                            />
                                            <Typography variant="body1" color="text.secondary">
                                                {review.comment}
                                            </Typography>
                                        </Box>
                                        {isOwnReview && (
                                            <Button
                                                variant="text"
                                                color="error"
                                                onClick={() => handleDeleteReview(review.id)}
                                                sx={{ alignSelf: 'flex-start' }}
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                    </Box>
                                </Card>
                            );
                        })}
                    </Stack>
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