import { useEffect, useState } from 'react';
import {
    Box,
    Select,
    MenuItem,
    Slider,
    Pagination,
    Typography,
    Grid,
    InputAdornment,
    Card, TextField,
} from '@mui/material';
import axios from '../api/axiosInstance';
import ServiceCard from './ServiceCard';
import {Search, Star} from '@mui/icons-material';
import {useAuth} from "../hooks/useAuth.ts";
import {serviceCategories} from "../data/categories.ts";

type Service = {
    id: string;
    title: string;
    description: string;
    price: number;
    rating: number;
    photoPath?: string;
    image?: string;
};

export default function Catalog() {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [price, setPrice] = useState<number[]>([0, 2000]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [rating, setRating] = useState<number | null>(null);

    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const {user} = useAuth(); // Получаем ID текущего пользователя

    useEffect(() => {
        const loadFavorites = async () => {
            if (user?.id) {
                try {
                    const response = await axios.get(`/favorites/${user.id}`);
                    const favorites = response.data;
                    setFavoriteIds(favorites.map((f: any) => f.serviceId));
                } catch (err) {
                    console.error('Ошибка загрузки избранного:', err);
                }
            }
        };
        loadFavorites();
    }, [user?.id]);

    useEffect(() => {
        // Добавим debounce для оптимизации запросов при вводе поиска
        const delayDebounceFn = setTimeout(() => {
            fetchServices();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, selectedCategory, price, rating, searchTerm]);

    const fetchServices = async () => {
        try {
            const params: Record<string, any> = {
                page,
                limit: 6,
            };

            if (selectedCategory) {
                params.category = selectedCategory;
            }

            const isPriceFiltered = price[0] > 0 || price[1] < 1000;
            if (isPriceFiltered) {
                params.minPrice = price[0];
                params.maxPrice = price[1];
            }

            if (rating !== null) {
                params.minRating = rating;
            }

            if (searchTerm.trim() !== '') {
                params.title = searchTerm.trim();
            }

            const response = await axios.get('/services', { params });

            const mappedServices = response.data.data.map((s) => ({
                ...s,
                image: s.photoPath,
            }));

            setServices(mappedServices);
            setTotalPages(response.data.meta.totalPages);
        } catch (err) {
            console.error('Ошибка при загрузке услуг:', err);
        }
    };

    const handleFavoriteToggle = async (serviceId: string) => {
        if (!user.id) return;
        try {
            if (favoriteIds.includes(serviceId)) {
                await axios.delete(`/favorites/${serviceId}`);
                setFavoriteIds(prev => prev.filter(id => id !== serviceId));
            } else {
                await axios.post('/favorites', { userId: user.id, serviceId: serviceId });
                setFavoriteIds(prev => [...prev, serviceId]);
            }
        } catch (err) {
            console.error('Ошибка обновления избранного:', err);
        }
    };

    return (
        <Box sx={{
            p: 4,
            maxWidth: 1400,
            margin: '0 auto',
            backgroundColor: 'background.default'
        }}>
            <Typography variant="h3" component="h1" sx={{
                mb: 4,
                fontWeight: 700,
                color: 'text.primary',
                textAlign: 'center'
            }}>
                Каталог услуг
            </Typography>

            {/* Фильтры */}
            <Card sx={{
                mb: 4,
                p: 3,
                boxShadow: 3,
                borderRadius: 4,
            }}>
                <Box display="flex" gap={3} flexWrap="wrap">
                    <Box flex="1 1 auto" sx={{marginTop: '30px'}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Поиск услуг..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="primary" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3 }
                            }}
                        />
                    </Box>

                    <Box flex="1 1 auto" sx={{marginTop: '30px'}}>
                        <TextField
                            select
                            label="Категория"
                            name="category"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                            }}
                            required
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                },
                            }}
                        >
                            {serviceCategories.map((group) => [
                                <MenuItem
                                    key={group.name}
                                    value={group.name}
                                    disabled
                                    sx={{ fontWeight: 700, bgcolor: 'action.hover' }}
                                >
                                    {group.name}
                                </MenuItem>,
                                ...group.subcategories.map((subcat) => (
                                    <MenuItem key={subcat} value={subcat} sx={{ pl: 4 }}>
                                        {subcat}
                                    </MenuItem>
                                )),
                            ])}
                        </TextField>
                    </Box>

                    <Box flex="1 1 auto">
                        <Typography variant="subtitle2" color="text.secondary" mb={1} sx={{marginBottom: '20px'}}>
                            Ценовой диапазон
                        </Typography>
                        <Slider
                            value={price}
                            onChange={(_, newValue) => {
                                setPrice(newValue as number[])
                                setPage(1);
                            }}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(v) => `${v} BYN`}
                            min={0}
                            max={2000}
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>

                    <Box flex="1 1 auto">
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                            Минимальный рейтинг
                        </Typography>
                        <Select

                            value={rating ?? ''}
                            onChange={(e) => {
                                setRating(e.target.value === '' ? null : Number(e.target.value));
                                setPage(1);
                            }}
                            variant="outlined"
                            sx={{ borderRadius: 3 }}
                        >
                            <MenuItem value="">
                                <Star sx={{ color: 'gold', mr: 1 }} />
                                Любой
                            </MenuItem>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <MenuItem key={r} value={r}>
                                    <Star sx={{ color: 'gold', mr: 1 }} />
                                    {r}+
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
            </Card>

            {/* Список услуг */}
            <Grid container spacing={4}>
                {services.length > 0 ? (
                    services.map((service) => (
                        <Grid sx={{ flex: "0 0 100%" }} key={service.id}>
                            <ServiceCard
                                service={service}
                                isFavorite={favoriteIds.includes(service.id)}
                                onFavoriteToggle={handleFavoriteToggle}
                                currentUserId={user?.id} // Добавляем передачу ID текущего пользователя
                            />
                        </Grid>
                    ))
                ) : (
                    <Box width="100%" textAlign="center" py={6}>
                        <Typography variant="h6" color="text.secondary">
                            По вашему запросу ничего не найдено
                        </Typography>
                    </Box>
                )}
            </Grid>

            {/* Пагинация */}
            {totalPages > 1 && (
                <Box mt={6} display="flex" justifyContent="center">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '1.1rem'
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
