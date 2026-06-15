import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Компоненты
import Navbar from './components/Navbar';

// Страницы
import HomePage from './pages/HomePage';
import Services from './pages/Services';
import Lawyers from './pages/Lawyers';
import Cases from './pages/Cases';
import CaseCreate from './pages/CaseCreate';
import CaseDetail from './pages/CaseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

// Компонент для защиты маршрутов (только для авторизованных)
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Загрузка...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Компонент для публичных маршрутов (редирект если уже авторизован)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Загрузка...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/lawyers" element={<Lawyers />} />

                    {/* Маршруты аутентификации */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* Защищённые маршруты (только для авторизованных) */}
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path="/cases" element={
                        <PrivateRoute>
                            <Cases />
                        </PrivateRoute>
                    } />
                    <Route path="/cases/create" element={
                        <PrivateRoute>
                            <CaseCreate />
                        </PrivateRoute>
                    } />
                    <Route path="/cases/:id" element={
                        <PrivateRoute>
                            <CaseDetail />
                        </PrivateRoute>
                    } />
                    <Route path="/favorites" element={
                        <PrivateRoute>
                            <Favorites />
                        </PrivateRoute>
                    } />

                    {/* 404 - страница не найдена */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

// Компонент 404
function NotFound() {
    return (
        <div className="text-center mt-5">
            <h1 className="display-1 text-muted">404</h1>
            <p className="lead">Страница не найдена</p>
            <a href="/" className="btn btn-primary">Вернуться на главную</a>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;