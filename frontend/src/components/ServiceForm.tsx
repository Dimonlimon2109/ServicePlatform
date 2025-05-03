import { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance.ts';

export default function ServiceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        duration: '',
        photo: null as File | null,
    });
    const [categories] = useState(['Ремонт', 'Уборка', 'Электрика', 'Сантехника']); // Пример категорий

    useEffect(() => {
        if (isEdit) {
            axios.get(`/services/${id}`).then(res => {
                const { title, description, price, category, duration, photoPath } = res.data;
                setForm({
                    title,
                    description,
                    price,
                    category,
                    duration,
                    photo: photoPath, // Это будет путь к изображению, который может быть отображен
                });
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm({ ...form, photo: e.target.files[0] });
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
        if (form.photo) {
            formData.append('photo', form.photo);
        }

        try {
            if (isEdit) {
                await axios.put(`/services/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post('/services', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            navigate('/catalog');
        } catch (err) {
            console.error('Ошибка при сохранении услуги:', err);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5">{isEdit ? 'Редактировать' : 'Создать'} услугу</Typography>
            <TextField
                label="Название"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
            />
            <TextField
                label="Описание"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
            />
            <TextField
                label="Цена"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
            />
            <TextField
                label="Категория"
                name="category"
                select
                value={form.category}
                onChange={handleChange}
                required
            >
                {categories.map((cat, index) => (
                    <MenuItem key={index} value={cat}>
                        {cat}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Продолжительность (в минутах)"
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                required
            />
            <Button variant="outlined" component="label">
                Загрузить фото
                <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {form.photo && <Typography>{form.photo.name}</Typography>}
            <Button type="submit" variant="contained" color="primary">
                Сохранить
            </Button>
        </Box>
    );
}
