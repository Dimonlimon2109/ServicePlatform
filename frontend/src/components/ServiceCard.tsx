// ServiceCard.tsx
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    Rating,
    useTheme,
    styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FavoriteBorder, Star } from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    transition: 'transform 0.3s, box-shadow 0.3s',
    overflow: 'hidden',
    height: 280,
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        height: 'auto'
    }
}));

export default function ServiceCard({ service }) {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <StyledCard>
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
                p: 3
            }}>
                <Box flex={1}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        {service.title}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" paragraph>
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
                    <Box>
                        <Chip
                            label={`${service.price} BYN`}
                            color="primary"
                            sx={{ fontWeight: 600, mr: 2 }}
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
                            textTransform: 'none'
                        }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </Box>
        </StyledCard>
    );
}
