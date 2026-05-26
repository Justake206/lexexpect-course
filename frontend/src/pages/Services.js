import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchServices();
    }, [currentPage]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/services/?page=${currentPage}`);
            setServices(response.data.results || response.data);
            setTotalPages(Math.ceil(response.data.count / 6) || 1);
        } catch (error) {
            console.error('Ошибка загрузки услуг:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (service) => {
        setSelectedService(service);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedService(null);
        document.body.style.overflow = 'auto';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted">Загрузка услуг...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-5">
                <div className="text-center mb-5 animate-fadeInUp">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style={{ width: '70px', height: '70px' }}>
                        <span className="fs-1">⚖️</span>
                    </div>
                    <h1 className="display-5 fw-bold mb-2">Юридические услуги</h1>
                    <p className="text-muted">Профессиональная помощь по доступным ценам</p>
                </div>

                <div className="row g-4">
                    {services.map((service, index) => (
                        <div key={service.id} className="col-md-6 col-lg-4">
                            <div
                                className="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift h-100"
                                style={{ cursor: 'pointer', minHeight: '350px' }}
                                onClick={() => openModal(service)}
                            >
                                <div className="card-body p-4 text-center d-flex flex-column h-100">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '70px', height: '70px' }}>
                                            <span className="fs-1">{service.icon || '⚖️'}</span>
                                        </div>
                                    </div>
                                    <h5 className="fw-bold mb-2">{service.title}</h5>
                                    {/* Обрезанное описание - 80 символов */}
                                    <p className="text-muted small mb-3 flex-grow-1">
                                        {service.description?.slice(0, 80)}...
                                    </p>
                                    <div className="mb-3">
                                        <span className="h4 text-primary fw-bold">{Number(service.price).toLocaleString()} ₽</span>
                                    </div>
                                    <div className="mt-auto">
                                        <button
                                            className="btn btn-primary rounded-pill px-4 w-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAuthenticated) {
                                                    window.location.href = '/cases/create';
                                                } else {
                                                    window.location.href = '/register';
                                                }
                                            }}
                                        >
                                            {isAuthenticated ? 'Заказать услугу' : 'Зарегистрироваться'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                        ← Назад
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                        Вперёд →
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Модальное окно для полного описания */}
            {selectedService && (
                <div
                    className="modal-overlay"
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1050,
                        cursor: 'pointer'
                    }}
                >
                    <div
                        className="modal-content-custom"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            cursor: 'default',
                            animation: 'scaleIn 0.3s ease-out'
                        }}
                    >
                        <div className="p-4">
                            <div className="text-center mb-3">
                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-1">{selectedService.icon || '⚖️'}</span>
                                </div>
                            </div>
                            <h3 className="fw-bold text-center mb-2">{selectedService.title}</h3>
                            <div className="text-center mb-3">
                                <span className="h2 text-primary fw-bold">{Number(selectedService.price).toLocaleString()} ₽</span>
                            </div>
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-2">Полное описание:</h6>
                                <p className="text-muted">{selectedService.description}</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1 rounded-pill"
                                    onClick={() => {
                                        closeModal();
                                        if (isAuthenticated) {
                                            window.location.href = '/cases/create';
                                        } else {
                                            window.location.href = '/register';
                                        }
                                    }}
                                >
                                    {isAuthenticated ? 'Заказать услугу' : 'Зарегистрироваться'}
                                </button>
                                <button
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                    onClick={closeModal}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Services;