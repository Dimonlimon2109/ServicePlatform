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
    Avatar,
    Chip,
    styled,
} from '@mui/material';
import {
    Check as CheckIcon,
    Clear as ClearIcon,
    DoneAll as CompleteIcon,
} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";

type User = {
    id: number;
    firstName: string;
    profilePhotoPath?: string;
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

const StatusChip = styled(Chip)({
    fontWeight: 500,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
});

const SmallAvatar = styled(Avatar)({
    width: 32,
    height: 32,
    marginRight: '12px',
});

const ServiceBookingsList = ({
                                 bookings,
                                 page,
                                 totalPages,
                                 rowsPerPage,
                                 onPageChange,
                                 onRowsPerPageChange,
                                 onAction,
                             }: Props) => {
    const navigate = useNavigate();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'primary';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return (
            <>
                <div>{date.toLocaleDateString()}</div>
                <div style={{ opacity: 0.75 }}>{date.toLocaleTimeString()}</div>
            </>
        );
    };

    return (
        <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 70 }}>ID</TableCell>
                            <TableCell sx={{ minWidth: 140 }}>Дата и время</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Статус</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>Пользователь</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow
                                key={booking.id}
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>#{booking.id}</TableCell>
                                <TableCell>{formatDateTime(booking.date)}</TableCell>
                                <TableCell>
                                    <StatusChip
                                        label={booking.status}
                                        color={getStatusColor(booking.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <SmallAvatar
                                            src={booking.user?.profilePhotoPath}
                                            alt={booking.user?.firstName}
                                        >
                                            {booking.user?.firstName?.[0]}
                                        </SmallAvatar>
                                        <Button
                                            variant="text"
                                            onClick={() => navigate(`/users/${booking.user.id}`)}
                                            size="small"
                                            sx={{ textTransform: 'none', padding: 0, minWidth: 0 }}
                                        >
                                            {booking.user?.firstName || 'Неизвестный пользователь'}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {/*{canConfirm(booking.status) && (*/}
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<CheckIcon />}
                                                onClick={() => onAction(booking.id, 'confirm')}
                                                size="small"
                                            >
                                                Подтвердить
                                            </Button>
                                        {/*)}*/}
                                        {/*{canCancel(booking.status, booking.date) && (*/}
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<ClearIcon />}
                                                onClick={() => onAction(booking.id, 'cancel')}
                                                size="small"
                                            >
                                                Отменить
                                            </Button>
                                        {/*)}*/}
                                        {/*{canComplete(booking.status, booking.date, booking.service?.duration || 0) && (*/}
                                            <Button
                                                variant="outlined"
                                                color="success"
                                                startIcon={<CompleteIcon />}
                                                onClick={() => onAction(booking.id, 'complete')}
                                                size="small"
                                            >
                                                Завершить
                                            </Button>
                                        {/*)}*/}
                                    </div>
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
                onPageChange={(_, newPage) => onPageChange(newPage + 1)}
                onRowsPerPageChange={(event) => {
                    const newRows = parseInt(event.target.value, 10);
                    onRowsPerPageChange(newRows);
                }}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
                }
                sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
            />
        </Paper>
    );
};

export default ServiceBookingsList;
