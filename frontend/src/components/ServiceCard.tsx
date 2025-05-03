import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Service {
    id: number;
    title: string;
    description: string;
    photoPath?: string;
    price: number;
    rating: number;
}



export default function ServiceCard( {service}) {
    const navigate = useNavigate();
    // Базовый путь к серверу, можно вынести в переменную окружения

    return (
        <Card
            sx={{
                height: 340,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {service.photoPath && (
                <CardMedia
                    component="img"
                    height="140"
                    image={service.photoPath}
                    alt={service.title}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default.jpg';
                    }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{service.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {service.description}
                </Typography>
                <Typography>Цена: {service.price} BYN</Typography>
                <Typography>Рейтинг: {service.rating}</Typography>
            </CardContent>
            <Box display="flex" justifyContent="space-between" p={1}>
                <Button onClick={() => navigate(`/services/${service.id}`)}>Подробнее</Button>
            </Box>
        </Card>
    );
}
