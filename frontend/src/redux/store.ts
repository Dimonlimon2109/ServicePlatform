import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Создаем store с middleware
const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export default store;
