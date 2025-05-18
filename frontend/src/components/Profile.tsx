import { useEffect, useState, useRef, ChangeEvent } from 'react';
import {
    Box,
    Typography,
    Avatar,
    CircularProgress,
    Button,
    TextField,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePhotoPath?: string;
    userType: string;
    isBlocked?: boolean;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function Profile() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState<Partial<ProfileData>>({});
    const [passwordData, setPasswordData] = useState<ChangePasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const endpoint = id ? `/users/${id}` : `/users/profile/me`;
                const res = await axios.get(endpoint);
                setProfile(res.data);
                setEditedData(res.data);
            } catch (e) {
                console.error('Ошибка получения профиля:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Новый пароль и подтверждение не совпадают');
            return false;
        }
        if (passwordData.newPassword.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return false;
        }
        return true;
    };

    const handlePasswordSubmit = async () => {
        if (!validatePassword()) return;
        if (!profile?.id) return;

        try {
            setActionLoading(true);
            setError('');
            setSuccess('');

            await axios.put(`/users/${profile.id}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccess('Пароль успешно изменен!');
            setChangePasswordOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при изменении пароля');
            console.error('Password change error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile || !profile.id) return;

        try {
            setActionLoading(true);
            setError('');
            setSuccess('');

            const changes = Object.keys(editedData).filter(
                key => editedData[key as keyof ProfileData] !== profile[key as keyof ProfileData]
            );

            if (changes.length === 0) {
                setEditMode(false);
                return;
            }

            const updatedFields: Partial<ProfileData> = {};
            changes.forEach(key => {
                updatedFields[key as keyof ProfileData] = editedData[key as keyof ProfileData]!;
            });

            const response = await axios.put(`/users/${profile.id}`, updatedFields);

            setProfile(response.data);
            setEditedData(response.data);
            setEditMode(false);
            setSuccess('Данные успешно обновлены!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при обновлении данных');
            console.error('Update error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!profile || !profile.id) return;

        try {
            setActionLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.put(
                `/users/${profile.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setProfile(prev => prev ? {...prev, profilePhotoPath: response.data.profilePhotoPath} : null);
            setSuccess('Фото профиля успешно обновлено!');
        } catch (err) {
            setError('Ошибка при загрузке изображения');
            console.error('Image upload error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!profile || !id) return;

        setActionLoading(true);
        try {
            const endpoint = `/users/${id}/${profile.isBlocked ? 'unblock' : 'block'}`;
            await axios.put(endpoint);

            const res = await axios.get(`/users/${id}`);
            setProfile(res.data);
            setSuccess(`Пользователь успешно ${profile.isBlocked ? 'разблокирован' : 'заблокирован'}`);
        } catch (e) {
            setError('Ошибка при изменении блокировки');
            console.error('Ошибка при изменении блокировки:', e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!profile || !id) return;

        setActionLoading(true);
        try {
            await axios.delete(`/users/${id}`);
            navigate('/users');
            setSuccess('Пользователь успешно удалён');
        } catch (e) {
            setError('Ошибка при удалении пользователя');
            console.error('Ошибка при удалении пользователя:', e);
        } finally {
            setActionLoading(false);
        }
    };

    const canEdit = !id || localStorage.userId === id || localStorage.userType === 'ADMIN';
    const canChangePassword = !id || localStorage.userId === id || localStorage.userType === 'ADMIN';
    const canBlockOrUnblock = id && localStorage.userType === 'ADMIN' && typeof profile?.isBlocked === 'boolean';
    const isAdmin = localStorage.userType === 'ADMIN';

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
        </Box>
    );

    if (!profile) return <Typography variant="h6">Профиль не найден</Typography>;

    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert severity="error" variant="filled">{error}</Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert severity="success" variant="filled">{success}</Alert>
            </Snackbar>

            {/* Диалог смены пароля */}
            <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
                <DialogTitle>Смена пароля</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2} width={400}>
                        <TextField
                            label="Текущий пароль"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                        />
                        <TextField
                            label="Новый пароль"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                        />
                        <TextField
                            label="Подтвердите новый пароль"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setChangePasswordOpen(false)}
                        disabled={actionLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePasswordSubmit}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} /> : null}
                    >
                        Сменить пароль
                    </Button>
                </DialogActions>
            </Dialog>

            <Box position="relative">
                <Avatar
                    src={profile.profilePhotoPath}
                    sx={{
                        width: 120,
                        height: 120,
                        fontSize: '2.5rem',
                        border: theme => `2px solid ${theme.palette.primary.main}`,
                        cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                />
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0]);
                        }
                    }}
                />
                {canEdit && !editMode && (
                    <IconButton
                        sx={{
                            position: 'absolute',
                            bottom: -8,
                            right: -8,
                            backgroundColor: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        onClick={() => setEditMode(true)}
                    >
                        <EditIcon sx={{ color: 'white' }} />
                    </IconButton>
                )}
            </Box>

            {editMode ? (
                <Box width="100%" maxWidth={500} display="flex" flexDirection="column" gap={3}>
                    <TextField
                        label="Имя"
                        name="firstName"
                        value={editedData.firstName || ''}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />

                    <TextField
                        label="Фамилия"
                        name="lastName"
                        value={editedData.lastName || ''}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />

                    <TextField
                        label="Телефон"
                        name="phone"
                        value={editedData.phone || ''}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        placeholder="+7 (XXX) XXX-XX-XX"
                    />

                    <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setEditMode(false);
                                setEditedData(profile);
                            }}
                            disabled={actionLoading}
                        >
                            Отмена
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={actionLoading}
                            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
                        >
                            Сохранить
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box textAlign="center">
                    <Typography variant="h4" gutterBottom>
                        {profile.firstName} {profile.lastName}
                    </Typography>

                    <Typography variant="body1" paragraph>
                        <strong>Email:</strong> {profile.email}
                    </Typography>

                    <Typography variant="body1" paragraph>
                        <strong>Телефон:</strong> {profile.phone || 'не указан'}
                    </Typography>

                    {profile.userType === 'ADMIN' && (
                        <Typography variant="body1" color="primary">
                            Роль: Администратор
                        </Typography>
                    )}
                </Box>
            )}

            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                {canChangePassword && (
                    <Button
                        variant="outlined"
                        startIcon={<LockResetIcon />}
                        onClick={() => setChangePasswordOpen(true)}
                    >
                        Сменить пароль
                    </Button>
                )}

                {id && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate(`/chat/${id}`)}
                        disabled={actionLoading}
                    >
                        Написать сообщение
                    </Button>
                )}

                {canBlockOrUnblock && (
                    <Button
                        variant="contained"
                        color={profile.isBlocked ? 'success' : 'error'}
                        onClick={handleBlockToggle}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} /> : null}
                    >
                        {profile.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                    </Button>
                )}

                {isAdmin && id && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDelete}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} /> : null}
                    >
                        Удалить пользователя
                    </Button>
                )}
            </Box>
        </Box>
    );
}
