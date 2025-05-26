// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setUser(null);
            return;
        }

        axios.get('/users/profile/me')
            .then( async(res) =>{
                if(res.data.isBlocked)
                {
                    await axios.post('auth/logout');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    toast.error('Вы заблокированы');
                    navigate('/login');
                }
                else
                {
                    setUser(res.data);
                }
            })
            .catch( () => {
                setUser(null);
            });
    }, [navigate]);

    return { user };
}