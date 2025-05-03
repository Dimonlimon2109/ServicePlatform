import { useEffect, useState } from 'react';
import {
    Box,
    Select,
    MenuItem,
    Slider,
    Pagination,
    Typography,
    Grid
} from '@mui/material';
import axios from '../api/axiosInstance';
import ServiceCard from './ServiceCard';

type Service = {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    photoPath?: string;
};

type Category = {
    id: number;
    name: string;
};

export default function Catalog() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [price, setPrice] = useState<number[]>([0, 1000]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setCategories([
            { id: 1, name: 'Ремонт' },
            { id: 2, name: 'Обучение' },
            { id: 3, name: 'Консультации' }
        ]);
    }, []);

    useEffect(() => {
        fetchServices();
    }, [page, selectedCategory, price]);

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

            const response = await axios.get('/services', { params });

            // Преобразуем поле photoPath -> image
            const mappedServices = response.data.data.map((s: any) => ({
                ...s,
                image: s.photoPath
            }));

            setServices(mappedServices);
            setTotalPages(response.data.meta.totalPages);
        } catch (err) {
            console.error('Ошибка при загрузке услуг:', err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/services/${id}`);
            fetchServices();
        } catch (err) {
            console.error('Ошибка при удалении услуги:', err);
        }
    };

    return (
        <Box p={4}>
            <Typography variant="h4" mb={2}>Каталог услуг</Typography>

            <Box display="flex" gap={2} mb={3}>
                <Select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    displayEmpty
                >
                    <MenuItem value="">Все категории</MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>

                <Box width={200}>
                    <Typography>Цена</Typography>
                    <Slider
                        value={price}
                        onChange={(_, newValue) => setPrice(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={0}
                        max={1000}
                    />
                </Box>
            </Box>

            <Grid container spacing={2}>
                {services.length > 0 ? (
                    services.map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                            <ServiceCard service={service} onDelete={handleDelete} />
                        </Grid>
                    ))
                ) : (
                    <Typography>Услуги не найдены</Typography>
                )}
            </Grid>

            <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                />
            </Box>
        </Box>
    );
}
