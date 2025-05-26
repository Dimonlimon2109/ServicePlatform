import { useEffect, useState, useRef, ChangeEvent } from 'react';
import {
    Box,
    Typography,
    Avatar,
    CircularProgress,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import {useAuth} from "../hooks/useAuth.ts";
import {toast} from "react-toastify";

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
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

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
            toast.error('Новый пароль и подтверждение не совпадают');
            return false;
        }
        if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 64) {
            toast.error('Пароль должен содержать минимум 6 символов и максимум 64 символа');
            return false;
        }
        if (passwordData.newPassword === passwordData.currentPassword) {
            toast.error('Новый пароль совпадает со старым');
            return false;
        }
        return true;
    };

    const handlePasswordSubmit = async () => {
        if (!validatePassword()) return;
        if (!profile?.id) return;

        try {
            setActionLoading(true);

            await axios.put(`/users/${profile.id}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Пароль успешно изменен!');
            setChangePasswordOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.log();

            toast.error(err.response?.data?.message.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Добавим новую функцию валидации профиля
    const validateProfileData = () => {
        if (!editedData.firstName?.trim()) {
            toast.error('Имя обязательно для заполнения');
            return false;
        }
        if (!editedData.lastName?.trim()) {
            toast.error('Фамилия обязательна для заполнения');
            return false;
        }
        if (!editedData.phone?.trim()) {
            toast.error('Номер телефона обязателен для заполнения');
            return false;
        }
        if (editedData.phone && !/^\+375(25|29|33|44)\d{7}$/.test(editedData.phone)) {
            toast.error('Телефон должен быть в формате +375|25|29|33|44|XXXXXXX');
            return false;
        }
        return true;
    };



    const handleSave = async () => {
        if (!profile || !profile.id) return;
        if (!validateProfileData()) return;
        try {
            setActionLoading(true);

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
            toast.success('Данные успешно обновлены!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при обновлении данных');
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
            toast.success('Фото профиля успешно обновлено!');
        } catch (err) {
            toast.error('Ошибка при загрузке изображения');
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
            toast.success(`Пользователь успешно ${profile.isBlocked ? 'разблокирован' : 'заблокирован'}`);
        } catch (e) {
            toast.error('Ошибка при изменении блокировки');
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
            toast.success('Пользователь успешно удалён');
        } catch (e) {
            toast.error('Ошибка при удалении пользователя');
            console.error('Ошибка при удалении пользователя:', e);
        } finally {
            setActionLoading(false);
        }
    };

    const canEdit = !id || user?.id === id || user?.userType === 'ADMIN';
    const canChangePassword = !id || user?.id === id || user?.userType === 'ADMIN';
    const canBlockOrUnblock = id && user?.userType === 'ADMIN' && typeof profile?.isBlocked === 'boolean';
    const isAdmin = user?.userType === 'ADMIN';

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
        </Box>
    );

    if (!profile) return <Typography variant="h6">Профиль не найден</Typography>;

    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={3}>

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
                        objectFit: 'cover', width: '300px', aspectRatio: '1.66',
                        height: '300px',
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
                        placeholder="+375|25|29|33|44|XXXXXXX"
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
