import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка пользователя при монтировании
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    // Получение профиля пользователя
    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/profile/');
            setUser(response.data);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } finally {
            setLoading(false);
        }
    };

    // Регистрация
    const register = async (userData) => {
        setError(null);
        try {
            const response = await api.post('/auth/register/', userData);
            const { access, refresh, user } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setUser(user);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                                 error.response?.data?.password?.[0] ||
                                 'Ошибка регистрации';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Вход
    const login = async (credentials) => {
        setError(null);
        try {
            const response = await api.post('/auth/login/', credentials);
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            await fetchUserProfile();

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Неверный логин или пароль';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Выход
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setError(null);
    };

    // Обновление профиля
    const updateProfile = async (profileData) => {
        setError(null);
        try {
            const response = await api.put('/auth/profile/', profileData);
            setUser(response.data);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Ошибка обновления профиля';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Очистка ошибки!
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        clearError,
        isAuthenticated: !!user,
        isLawyer: user?.user_type === 'lawyer',
        isClient: user?.user_type === 'client',
        isAdmin: user?.is_staff || user?.user_type === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};