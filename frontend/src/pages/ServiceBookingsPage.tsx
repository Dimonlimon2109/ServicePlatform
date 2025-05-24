import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    TextField,
    MenuItem,
} from '@mui/material';
import {toast} from 'react-toastify';
import axios from '../api/axiosInstance';
import ServiceBookingsList from '../components/ServiceBookingsList';

const ServiceBookingsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [bookings, setBookings] = useState([]);
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBookings = async () => {
        try {
            const params: any = {
                page,
                limit: rowsPerPage,
                ...(status && { status }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
            };

            const { data } = await axios.get(`/bookings/service/${id}`, { params });
            setBookings(data.items);
            setTotalPages(Math.ceil(data.total / rowsPerPage));
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
        }
    };

    const handleAction = async (bookingId: number, action: 'confirm' | 'cancel' | 'complete') => {
        try {
            const url = `/bookings/${bookingId}`;
            if (action === 'confirm') {
                await axios.put(`${url}`,{
                    status: 'CONFIRMED',
                });
            } else if (action === 'cancel') {
                await axios.put(`${url}`,
                    {
                        status: 'CANCELLED',
                    });
            } else if (action === 'complete') {
                await axios.put(`${url}`,
                    {
                        status: 'COMPLETED',
                    });
            }
            toast.success('Действие выполнено успешно');
            fetchBookings(); // обновляем данные
        } catch (error) {
            console.error('Ошибка при выполнении действия:', error);
            toast.error('Ошибка при выполнении действия');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, rowsPerPage, status, startDate, endDate]);

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                История бронирований услуги
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid>
                    <TextField
                        fullWidth
                        label="Статус"
                        select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        variant="outlined"
                    >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="PENDING">Ожидается</MenuItem>
                        <MenuItem value="CONFIRMED">Подтверждено</MenuItem>
                        <MenuItem value="CANCELLED">Отменено</MenuItem>
                        <MenuItem value="COMPLETED">Завершено</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="Дата начала"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="Дата конца"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>

            <ServiceBookingsList
                bookings={bookings}
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(newRows) => {
                    setRowsPerPage(newRows);
                    setPage(1); // сбросить страницу при смене размера
                }}
                onAction={handleAction}
            />
        </Box>
    );
};

export default ServiceBookingsPage;
