import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
} from '@mui/material';

type User = {
    firstName: string;
};

type Service = {
    duration: number;
};

type Booking = {
    id: number;
    date: string;
    status: string;
    user: User;
    service: Service;
};

type Props = {
    bookings: Booking[];
    page: number;
    totalPages: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onAction: (bookingId: number, action: 'confirm' | 'cancel' | 'complete') => void;
};

const ServiceBookingsList = ({
                                 bookings,
                                 page,
                                 totalPages,
                                 rowsPerPage,
                                 onPageChange,
                                 onRowsPerPageChange,
                                 onAction,
                             }: Props) => {
    const canConfirm = (status: string) => !['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status);

    const canCancel = (status: string, date: string) => {
        const now = new Date();
        return !['COMPLETED', 'CANCELLED'].includes(status) && new Date(date) > now;
    };

    const canComplete = (status: string, date: string, duration: number) => {
        const now = new Date();
        const endDate = new Date(date);
        endDate.setMinutes(endDate.getMinutes() + duration);
        return !['CANCELLED', 'PENDING', 'COMPLETED'].includes(status) && now >= endDate;
    };

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Дата</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Пользователь</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>{booking.id}</TableCell>
                                <TableCell>{new Date(booking.date).toLocaleString()}</TableCell>
                                <TableCell>{booking.status}</TableCell>
                                <TableCell>{booking.user?.firstName || '—'}</TableCell>
                                <TableCell>
                                    {canConfirm(booking.status) && (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => onAction(booking.id, 'confirm')}
                                            sx={{ mr: 1, mb: 1 }}
                                        >
                                            Подтвердить
                                        </Button>
                                    )}
                                    {canCancel(booking.status, booking.date) && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => onAction(booking.id, 'cancel')}
                                            sx={{ mr: 1, mb: 1 }}
                                        >
                                            Отклонить
                                        </Button>
                                    )}
                                    {canComplete(booking.status, booking.date, booking.service?.duration || 0) && (
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={() => onAction(booking.id, 'complete')}
                                        >
                                            Завершить
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={totalPages * rowsPerPage}
                rowsPerPage={rowsPerPage}
                page={page - 1}
                onPageChange={(event, newPage) => onPageChange(newPage + 1)}
                onRowsPerPageChange={(event) => {
                    const newRows = parseInt(event.target.value, 10);
                    onRowsPerPageChange(newRows);
                }}
            />
        </Paper>
    );
};

export default ServiceBookingsList;
