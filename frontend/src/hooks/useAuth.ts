// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

export function useAuth() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        axios.get('/users/profile/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    return { user };
}
