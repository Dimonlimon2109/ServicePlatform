import {
    Box, Card, CardContent, Typography, Grid,
    FormControl, InputLabel, Select, MenuItem,
    TextField, Pagination, Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.ts';
import dayjs from 'dayjs';

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
        <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                        value={status}
                        label="Статус"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {statusOptions.map((s) => (
                            <MenuItem key={s} value={s}>{statusTranslations[s]}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="С даты"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                    label="По дату"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </Box>

            <Grid container spacing={2}>
                {bookings.map((booking: any) => {
                    const now = dayjs();
                    const bookingDate = dayjs(booking.date);
                    const durationMinutes = booking.service?.duration || 0;
                    const endOfService = bookingDate.add(durationMinutes, 'minute');

                    const canCancel = now.isBefore(bookingDate);
                    const canComplete = now.isAfter(endOfService);

                    return (
                        <Grid item xs={12} md={6} key={booking.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{booking.service?.title}</Typography>
                                    <Typography>Дата: {bookingDate.format('DD.MM.YYYY HH:mm')}</Typography>
                                    <Typography>Статус: {statusTranslations[booking.status]}</Typography>

                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            //disabled={!canCancel || booking.status === 'CANCELLED' || booking.status === 'COMPLETED'}
                                            onClick={() => handleCancel(booking.id)}
                                        >
                                            Отклонить
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            //disabled={canComplete || booking.status === 'CANCELLED' || booking.status !== 'CONFIRMED' || booking.status === 'COMPLETED'}
                                            onClick={() => handleComplete(booking.id)}
                                        >
                                            Подтвердить выполнение
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={booking.status !== 'COMPLETED'}
                                            onClick={() => handlePayment(booking.id, booking.service.price)}
                                        >
                                            Оплатить
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                />
            </Box>
        </>
    );
};

export default BookingsList;
