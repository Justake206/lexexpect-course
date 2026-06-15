import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [isAuthenticated, navigate]);

    const fetchFavorites = async () => {
        try {
            const response = await api.get('/lawyers/my_favorites/');
            setFavorites(response.data);
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (lawyerId, lawyerName) => {
        setRemovingId(lawyerId);
        try {
            await api.delete(`/lawyers/${lawyerId}/remove_from_favorites/`);
            setFavorites(prev => prev.filter(f => f.lawyer !== lawyerId));
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при удалении из избранного');
        } finally {
            setRemovingId(null);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(i < Math.floor(rating) ? '★' : '☆');
        }
        return stars.join('');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted">Загрузка избранного...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-5">
                <div className="text-center mb-5 animate-fadeInUp">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style={{ width: '70px', height: '70px' }}>
                        <span className="fs-1">❤️</span>
                    </div>
                    <h1 className="display-5 fw-bold mb-2">Моё избранное</h1>
                    <p className="text-muted">Сохранённые адвокаты</p>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-5">
                        <span className="display-1 opacity-25">❤️</span>
                        <p className="text-muted mt-3">У вас пока нет избранных адвокатов</p>
                        <Link to="/lawyers" className="btn btn-primary rounded-pill px-4 mt-2">
                            Перейти к адвокатам
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {favorites.map((fav) => (
                            <div key={fav.id} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift h-100">
                                    <div className="card-body p-4 text-center d-flex flex-column h-100">
                                        <div className="mb-3">
                                            {fav.lawyer_photo ? (
                                                <img
                                                    src={fav.lawyer_photo}
                                                    className="rounded-circle object-fit-cover border border-3 border-primary"
                                                    alt={fav.lawyer_name}
                                                    style={{ width: '100px', height: '100px' }}
                                                />
                                            ) : (
                                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '100px', height: '100px' }}>
                                                    <span className="fs-1">⚖️</span>
                                                </div>
                                            )}
                                        </div>

                                        <h5 className="fw-bold mb-1">{fav.lawyer_name}</h5>
                                        <p className="text-primary small mb-2">{fav.lawyer_specialization}</p>

                                        <div className="mb-2">
                                            <span className="text-warning">{renderStars(Number(fav.lawyer_rating) || 0)}</span>
                                            <span className="text-muted small ms-1">({fav.lawyer_rating || 0})</span>
                                        </div>

                                        <p className="text-muted small mb-2">📅 {fav.lawyer_experience || 0} лет опыта</p>

                                        {fav.lawyer_bio && (
                                            <p className="text-muted small flex-grow-1">
                                                {fav.lawyer_bio.slice(0, 80)}...
                                            </p>
                                        )}

                                        <div className="mt-auto">
                                            <button
                                                className="btn btn-danger rounded-pill px-4 w-100 mb-2"
                                                onClick={() => handleRemoveFromFavorites(fav.lawyer, fav.lawyer_name)}
                                                disabled={removingId === fav.lawyer}
                                            >
                                                {removingId === fav.lawyer ? (
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                ) : (
                                                    '❤️ Удалить из избранного'
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-outline-primary rounded-pill px-4 w-100"
                                                onClick={() => window.location.href = '/cases/create'}
                                            >
                                                Записаться на консультацию
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;