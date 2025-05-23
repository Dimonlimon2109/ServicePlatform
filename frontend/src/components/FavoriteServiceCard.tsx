import { Card, CardMedia, CardContent, CardActions, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

interface FavoriteServiceCardProps {
    service: {
        id: string;
        title: string;
        description: string;
        price: number;
        category: string;
        photoPath: string;
        duration: number;
        rating: number;
        provider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
    onRemove: (serviceId: string) => void;
}

const FavoriteServiceCard = ({ service, onRemove }: FavoriteServiceCardProps) => {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: 3 }
        }}>
            <CardMedia
                component="img"
                height="200"
                image={service.photoPath}
                alt={service.title}
                sx={{ objectFit: 'cover' }}
            />

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                    {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {service.description}
                </Typography>

                <Typography variant="body2" sx={{ mt: 'auto' }}>
                    <strong>Цена:</strong> {service.price} ₽
                </Typography>
                <Typography variant="body2">
                    <strong>Длительность:</strong> {service.duration} мин
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Категория: {service.category}
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                    size="small"
                    component={Link}
                    to={`/services/${service.id}`}
                    variant="outlined"
                >
                    Подробнее
                </Button>
                <IconButton
                    aria-label="Удалить из избранного"
                    onClick={() => onRemove(service.id)}
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default FavoriteServiceCard;
