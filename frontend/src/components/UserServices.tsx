import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, Pagination, Stack } from '@mui/material';
import axios from '../api/axiosInstance';
import ServiceCard from '../components/ServiceCard';
import { useNavigate } from 'react-router-dom';

interface Service {
    id: number;
    title: string;
    description: string;
    photoPath?: string;
    price: number;
    rating: number;
}

interface PaginatedResponse {
    data: Service[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const UserServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;

    const navigate = useNavigate();

    const fetchMyServices = async (currentPage: number) => {
        try {
            const response = await axios.get<PaginatedResponse>(`/services/provider/me?page=${currentPage}&limit=${limit}`);
            setServices(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (error) {
            console.error('Ошибка при загрузке услуг пользователя', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) return;

        try {
            await axios.delete(`/services/${id}`);
            // Повторный запрос текущей страницы после удаления
            fetchMyServices(page);
        } catch (error) {
            console.error('Ошибка при удалении услуги', error);
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/services/edit/${id}`);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        fetchMyServices(page);
    }, [page]);

    return (
        <Box p={4} maxWidth={1200} margin="0 auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">Мои услуги</Typography>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate('/services/create')}
                    sx={{ borderRadius: 2, py: 1.5 }}
                >
                    Добавить услугу
                </Button>
            </Box>

            {services.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                    У вас пока нет добавленных услуг.
                </Typography>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {services.map((service) => (
                            <Grid item xs={12} sm={6} md={4} key={service.id}>
                                <ServiceCard service={service} />

                                {/* Контейнер для кнопок */}
                                <Stack spacing={1} mt={1.5}>
                                    {/* Группа основных действий */}
                                    <Box display="flex" gap={1}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleEdit(service.id)}
                                            sx={{ flex: 1 }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDelete(service.id)}
                                            sx={{
                                                minWidth: 48,
                                                px: 2,
                                                borderWidth: 2,
                                                '&:hover': { borderWidth: 2 }
                                            }}
                                        >
                                            Удалить
                                        </Button>
                                    </Box>

                                    {/* Кнопка истории бронирований */}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => navigate(`/services/${service.id}/bookings`)}
                                    >
                                        История бронирований
                                    </Button>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <Box mt={4} display="flex" justifyContent="center">
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
export default UserServices;
