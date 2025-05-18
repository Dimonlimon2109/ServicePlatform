import React from 'react';
import UserDetail from '../components/UsersListComponent.tsx';
import { Container } from '@mui/material';

const UsersPage: React.FC = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <UserDetail />
        </Container>
    );
};

export default UsersPage;
