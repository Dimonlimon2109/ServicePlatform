import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating } from '@mui/material';
import { useState } from 'react';
import axios from '../api/axiosInstance';

interface AddReviewModalProps {
    open: boolean;
    onClose: () => void;
    serviceId: number;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ open, onClose, serviceId }) => {
    const [text, setText] = useState('');
    const [rating, setRating] = useState<number | null>(5);

    const handleSubmit = async () => {
        try {
            await axios.post(`/reviews`, {
                serviceId,
                text,
                rating,
            });
            onClose();
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Оставить отзыв</DialogTitle>
            <DialogContent>
                <Rating
                    value={rating}
                    onChange={(_, newValue) => setRating(newValue)}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Комментарий"
                    multiline
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Отправить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddReviewModal;
