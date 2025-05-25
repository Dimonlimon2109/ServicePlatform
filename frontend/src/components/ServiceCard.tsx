// ServiceCard.tsx
import {
    Card,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    Rating,
    useTheme,
    styled,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Star, Favorite, FavoriteBorder } from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    transition: 'transform 0.3s, box-shadow 0.3s',
    overflow: 'hidden',
    height: 280,
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        height: 'auto'
    }
}));

type Service = {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    photoPath?: string;
};

type ServiceCardProps = {
    service: Service;
    isFavorite: boolean;
    onFavoriteToggle: (serviceId: number) => void;
};

export default function ServiceCard({
                                        service,
                                        isFavorite,
                                        onFavoriteToggle
                                    }: ServiceCardProps) {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <StyledCard>
            {/* Кнопка избранного */}
            <IconButton
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                }}
                onClick={() => onFavoriteToggle(service.id)}
            >
                {isFavorite ? (
                    <Favorite sx={{ color: theme.palette.error.main }} />
                ) : (
                    <FavoriteBorder sx={{ color: theme.palette.text.primary }} />
                )}
            </IconButton>

            <CardMedia
                component="img"
                sx={{
                    width: 400,
                    objectFit: 'cover',
                    [theme.breakpoints.down('sm')]: {
                        width: '100%',
                        height: 200
                    }
                }}
                image={service.photoPath || '/default-service.jpg'}
                alt={service.title}
            />

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                p: 3,
                position: 'relative'
            }}>
                <Box flex={1}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        {service.title}
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {service.description}
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mt: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={`${service.price.toLocaleString()} BYN`}
                            color="primary"
                            sx={{
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                px: 1.5,
                                py: 0.5
                            }}
                        />
                        <Rating
                            value={service.rating}
                            precision={0.5}
                            readOnly
                            icon={<Star sx={{ color: 'gold' }} />}
                            emptyIcon={<Star sx={{ color: theme.palette.divider }} />}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(`/services/${service.id}`)}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: 160
                        }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </Box>
        </StyledCard>
    );
}