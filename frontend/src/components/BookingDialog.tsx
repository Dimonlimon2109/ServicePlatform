import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, CircularProgress, Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import axios from '../api/axiosInstance';

interface BookingDialogProps {
    open: boolean;
    onClose: () => void;
    serviceId: string;
    userId: string;
}

export default function BookingDialog({ open, onClose, serviceId, userId }: BookingDialogProps) {
    const [date, setDate] = useState<Dayjs | null>(dayjs().add(1, 'hour'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleBooking = async () => {
        if (!date) {
            setError('Укажите дату и время');
            return;
        }

        if (date.isBefore(dayjs())) {
            setError('Дата и время должны быть в будущем');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post('/bookings', {
                serviceId,
                userId,
                date: date.toISOString(),
                status: 'PENDING',
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 1000);
        } catch (err) {
            setError('Не удалось создать бронирование');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Бронирование услуги</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Успешно забронировано!</Alert>}
                <DateTimePicker
                    label="Дата и время"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    minDateTime={dayjs()}
                    format="DD.MM.YYYY HH:mm"
                    disablePast
                    ampm={false}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{ textField: TextField }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal',
                            helperText: 'Выберите дату и время в будущем'
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Отмена</Button>
                <Button
                    onClick={handleBooking}
                    variant="contained"
                    disabled={loading || !date}
                >
                    {loading ? <CircularProgress size={24} /> : 'Забронировать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}