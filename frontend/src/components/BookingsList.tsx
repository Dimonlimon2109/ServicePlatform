import {
    Box, Card, CardContent, Typography, Grid,
    FormControl, InputLabel, Select, MenuItem,
    TextField, Pagination, Button,
    DialogContent,
    Dialog,
    DialogTitle, DialogActions, Rating,
    Stack,
    Avatar, Chip, CardMedia
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.ts';
import dayjs from 'dayjs';
import {toast} from "react-toastify";
import {CalendarToday, Cancel, CheckCircle, Payment, RateReview, Star } from '@mui/icons-material';

const statusOptions = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', "PAID"];
const statusTranslations: Record<string, string> = {
    PENDING: 'В ожидании',
    CONFIRMED: 'Подтверждено',
    CANCELLED: 'Отклонено',
    COMPLETED: 'Завершено',
    PAID: 'Оплачено'
};

const BookingsList = () => {
    const [bookings, setBookings] = useState([]);
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [reviewRating, setReviewRating] = useState<number | null>(null);


    const handleOpenReviewModal = (serviceId: number) => {
        setSelectedServiceId(serviceId);
        setIsReviewOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewOpen(false);
        setReviewText('');
        setReviewRating(null);
    };


    const handleSubmitReview = async () => {
        if (!selectedServiceId || !reviewRating) {
            alert('Пожалуйста, укажите оценку и комментарий.');
            return;
        }
console.log(reviewRating);
        try {
            await axios.post('/reviews', {
                serviceId: selectedServiceId,
                comment: reviewText,
                rating: reviewRating
            });
            handleCloseReviewModal();
            toast.success('Отзыв успешно добавлен');
        } catch (error) {
            toast.error('Ошибка при добавлении отзыва');
        }
    };


    const fetchBookings = async () => {
        const params: any = {
            page,
            limit: 6,
        };
        if (status) params.status = status;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const { data } = await axios.get('/bookings/user/me', { params });
        setBookings(data.items);
        setTotalPages(Math.ceil(data.total / 6));
    };

    useEffect(() => {
        fetchBookings();
    }, [page, status, startDate, endDate]);

    const handleCancel = async (id: number) => {
        await axios.put(`/bookings/${id}`, {
            status: 'CANCELLED',
        });
        fetchBookings();
    };

    const handleComplete = async (id: number) => {
        await axios.put(`/bookings/${id}`,{
            status: 'COMPLETED',
        });
        fetchBookings();
    };

    const handlePayment = async (id: string, amount: number) => {
        try {
            // Запрос на создание сессии в Stripe
            const response = await axios.post('/bookings/pay', {
                bookingId: id,
                amount: amount
            });

            // Если запрос прошёл успешно, получаем URL для перенаправления на Stripe Checkout
            if (response.data.url) {
                // Перенаправляем пользователя на страницу оплаты
                window.location.href = response.data.url;
            } else {
                alert('Ошибка при создании сессии оплаты!');
            }
        } catch (error) {
            alert('Ошибка при обработке запроса на оплату!');
        }
    };
    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
            {/* Фильтры */}
            <Card sx={{ mb: 3, p: 2, boxShadow: 3, borderRadius: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={status}
                            label="Статус"
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{ borderRadius: 3 }}
                        >
                            <MenuItem value="">Все статусы</MenuItem>
                            {statusOptions.map((s) => (
                                <MenuItem key={s} value={s}>
                                    <Chip
                                        label={statusTranslations[s]}
                                        size="small"
                                        sx={{
                                            mr: 1,
                                            bgcolor: statusColorMap[s]?.light,
                                            color: statusColorMap[s]?.dark
                                        }}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="С даты"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <CalendarToday sx={{ color: 'action.active', mr: 1 }} />
                            )
                        }}
                        sx={{ flex: 1 }}
                    />

                    <TextField
                        label="По дату"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <CalendarToday sx={{ color: 'action.active', mr: 1 }} />
                            )
                        }}
                        sx={{ flex: 1 }}
                    />
                </Stack>
            </Card>

            {/* Список бронирований */}
            <Grid container spacing={3}>
                {bookings.map((booking: any) => {
                    const now = dayjs();
                    const bookingDate = dayjs(booking.date);
                    const durationMinutes = booking.service?.duration || 0;
                    const endOfService = bookingDate.add(durationMinutes, 'minute');

                    const canCancel = now.isBefore(bookingDate);
                    const canComplete = now.isAfter(endOfService);

                    return (
                        <Grid item xs={12} md={6} lg={4} key={booking.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 3,
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}>
                                {/* Изображение сервиса */}
                                {booking.service?.photoPath && (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={booking.service.photoPath}
                                        alt={booking.service.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                )}

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack spacing={1.5}>
                                        <Typography variant="h6" fontWeight={600}>
                                            {booking.service?.title}
                                        </Typography>

                                        <Chip
                                            label={statusTranslations[booking.status]}
                                            color={statusColorMap[booking.status]?.color}
                                            variant="filled"
                                            sx={{ alignSelf: 'flex-start' }}
                                        />

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <CalendarToday fontSize="small" />
                                            </Avatar>
                                            <Typography>
                                                {bookingDate.format('DD MMM YYYY, HH:mm')}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                <Star fontSize="small" />
                                            </Avatar>
                                            <Typography>
                                                Длительность: {durationMinutes} минут
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>

                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Stack spacing={1}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Cancel />}
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={!canCancel || ['CANCELLED', 'COMPLETED'].includes(booking.status)}
                                        >
                                            Отменить бронь
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Payment />}
                                            onClick={() => handlePayment(booking.id, booking.service.price)}
                                            disabled={booking.status !== 'COMPLETED'}
                                        >
                                            Оплатить ({booking.service?.price} BYN)
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<RateReview />}
                                            onClick={() => handleOpenReviewModal(booking.service?.id)}
                                            disabled={!['COMPLETED', 'PAID'].includes(booking.status)}
                                        >
                                            Оставить отзыв
                                        </Button>
                                    </Stack>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Пагинация */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                    color="primary"
                    shape="rounded"
                    size="large"
                />
            </Box>

            {/* Диалог отзыва */}
            <Dialog
                open={isReviewOpen}
                onClose={handleCloseReviewModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    Оставить отзыв
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Box textAlign="center">
                            <Rating
                                name="rating"
                                value={reviewRating}
                                onChange={(_, newValue) => setReviewRating(newValue)}
                                size="large"
                                icon={<Star sx={{ color: 'gold', fontSize: 40 }} />}
                                emptyIcon={<Star sx={{ color: 'action.disabled', fontSize: 40 }} />}
                            />
                        </Box>

                        <TextField
                            multiline
                            fullWidth
                            minRows={4}
                            label="Ваш комментарий"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseReviewModal}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmitReview}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Опубликовать отзыв
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const statusColorMap = {
    PENDING: { color: 'warning', light: '#fff3e0', dark: '#ef6c00' },
    CONFIRMED: { color: 'info', light: '#e3f2fd', dark: '#1976d2' },
    COMPLETED: { color: 'success', light: '#e8f5e9', dark: '#2e7d32' },
    CANCELLED: { color: 'error', light: '#ffebee', dark: '#d32f2f' },
    PAID: { color: 'secondary', light: '#f3e5f5', dark: '#9c27b0' }
};


export default BookingsList;
