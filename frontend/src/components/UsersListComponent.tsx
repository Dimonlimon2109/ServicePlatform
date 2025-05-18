import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    Select,
    MenuItem,
    Pagination,
    Grid,
    InputLabel,
    FormControl,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    isBlocked: boolean;
    createdAt: string;
}

interface UsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const UsersListComponent: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [emailFilter, setEmailFilter] = useState('');
    const [blockFilter, setBlockFilter] = useState<'all' | 'blocked' | 'unblocked'>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const params: any = {
                    page,
                    limit,
                };

                if (emailFilter) {
                    params.email = emailFilter;
                }

                if (blockFilter === 'blocked') {
                    params.isBlocked = true;
                } else if (blockFilter === 'unblocked') {
                    params.isBlocked = false;
                }

                const response = await axios.get<UsersResponse>('/users', { params });
                setUsers(response.data.data);
                setTotalPages(response.data.meta.totalPages);
                setError('');
            } catch (err) {
                setError('Ошибка при загрузке пользователей');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page, emailFilter, blockFilter]);

    const handleUserClick = (id: string) => {
        navigate(`/users/${id}`);
    };

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>Список пользователей</Typography>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Поиск по email"
                    value={emailFilter}
                    onChange={(e) => {
                        setEmailFilter(e.target.value);
                        setPage(1);
                    }}
                    type="search"
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Блокировка</InputLabel>
                    <Select
                        value={blockFilter}
                        onChange={(e) => {
                            setBlockFilter(e.target.value as 'all' | 'blocked' | 'unblocked');
                            setPage(1);
                        }}
                        label="Блокировка"
                    >
                        <MenuItem value="all">Все</MenuItem>
                        <MenuItem value="blocked">Заблокированные</MenuItem>
                        <MenuItem value="unblocked">Незаблокированные</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {users.map(user => (
                            <Grid item xs={12} md={6} lg={4} key={user.id}>
                                <Card
                                    onClick={() => handleUserClick(user.id)}
                                    sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { boxShadow: 6 } }}
                                >
                                    <CardContent>
                                        <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
                                        <Typography>Email: {user.email}</Typography>
                                        <Typography>Тип: {user.userType}</Typography>
                                        <Typography>Блокировка: {user.isBlocked ? 'Да' : 'Нет'}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box mt={4} display="flex" justifyContent="center">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default UsersListComponent;
