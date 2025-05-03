import { Container, Typography } from '@mui/material';
import BookingsList from '../components/BookingsList';

const BookingsPage = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Мои бронирования
            </Typography>
            <BookingsList />
        </Container>
    );
};

export default BookingsPage;
