import { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, MenuItem, Avatar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { serviceCategories } from '../data/categories';

export default function ServiceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [currentPhoto, setCurrentPhoto] = useState<{ path: string; file: File | null }>({
        path: '',
        file: null
    });

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        duration: '',
    });

    useEffect(() => {
        if (isEdit) {
            const fetchService = async () => {
                try {
                    const response = await axios.get(`/services/${id}`);
                    const { title, description, price, category, duration, photoPath } = response.data;

                    // Загружаем текущее изображение как Blob
                    const photoResponse = await axios.get(`${photoPath}`, {
                        responseType: 'blob'
                    });

                    const file = new File([photoResponse.data], photoPath, {
                        type: photoResponse.headers['content-type']
                    });

                    setCurrentPhoto({
                        path: photoPath,
                        file
                    });

                    setForm({
                        title,
                        description,
                        price: price.toString(),
                        category,
                        duration: duration.toString(),
                    });
                } catch (error) {
                    console.error('Error fetching service:', error);
                }
            };
            fetchService();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCurrentPhoto(prev => ({
                ...prev,
                file: e.target.files![0]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('category', form.category);
        formData.append('duration', form.duration);

        // Добавляем файл если он был изменен
        if (currentPhoto.file) {
            formData.append('photo', currentPhoto.file);
        } else if (isEdit) {
            // Для случая когда фото не меняли
            formData.append('photoPath', currentPhoto.path);
        }

        try {
            if (isEdit) {
                await axios.put(`/services/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await axios.post('/services', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
            navigate('/catalog');
        } catch (err) {
            console.error('Ошибка при сохранении услуги:', err);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: 800,
            mx: 'auto',
            p: 3
        }}>
            <Typography variant="h4" component="h1">
                {isEdit ? 'Редактирование услуги' : 'Создание новой услуги'}
            </Typography>

            {/* Превью изображения */}
            {currentPhoto.file && (
                <Avatar
                    src={URL.createObjectURL(currentPhoto.file)}
                    variant="rounded"
                    sx={{ width: 200, height: 200, mb: 2 }}
                />
            )}

            <TextField
                label="Название услуги"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                fullWidth
            />

            <TextField
                label="Описание"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                fullWidth
            />

            <Box display="flex" gap={3}>
                <TextField
                    label="Цена (BYN)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Длительность (минут)"
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    required
                    fullWidth
                />
            </Box>

            <TextField
                select
                label="Категория"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                fullWidth
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
                        <MenuItem
                            key={subcat}
                            value={subcat}
                            sx={{ pl: 4 }}
                        >
                            {subcat}
                        </MenuItem>
                    ))
                ])}
            </TextField>

            <Box>
                <Button
                    variant="outlined"
                    component="label"
                    sx={{ mb: 1 }}
                >
                    {isEdit ? 'Изменить фото' : 'Загрузить фото'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </Button>
                {currentPhoto.path && !currentPhoto.file && (
                    <Typography variant="body2" color="text.secondary">
                        Текущее фото: {currentPhoto.path}
                    </Typography>
                )}
            </Box>

            <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ alignSelf: 'flex-start', px: 4 }}
            >
                {isEdit ? 'Сохранить изменения' : 'Создать услугу'}
            </Button>
        </Box>
    );
}