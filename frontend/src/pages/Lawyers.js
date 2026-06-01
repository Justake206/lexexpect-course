import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Lawyers() {
    const [lawyers, setLawyers] = useState([]);
    const [filteredLawyers, setFilteredLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLawyers();
    }, []);

    useEffect(() => {
        filterLawyers();
    }, [searchTerm, selectedSpecialization, lawyers]);

    const fetchLawyers = async () => {
        try {
            const response = await api.get('/lawyers/');
            const data = response.data.results || response.data;
            setLawyers(data);
            const uniqueSpecs = [...new Set(data.map(l => l.specialization))];
            setSpecializations(uniqueSpecs);
        } catch (error) {
            console.error('Ошибка загрузки адвокатов:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterLawyers = () => {
        let filtered = [...lawyers];
        if (searchTerm) {
            filtered = filtered.filter(l =>
                (l.full_name || l.username).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedSpecialization) {
            filtered = filtered.filter(l => l.specialization === selectedSpecialization);
        }
        setFilteredLawyers(filtered);
    };

    const openModal = (lawyer) => {
        setSelectedLawyer(lawyer);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedLawyer(null);
        document.body.style.overflow = 'auto';
    };

    // Функция для кнопки "Записаться на консультацию"
    const handleConsultation = () => {
        if (!isAuthenticated) {
            if (window.confirm('Для создания заявки необходимо войти в систему. Перейти на страницу входа?')) {
                navigate('/login');
            }
            return;
        }

        alert(
            'Для записи на консультацию перейдите в раздел "Мои заявки" → "Новая заявка".\n\n' +
            'Вашу заявку увидит и сможет принять любой свободный адвокат.'
        );
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
                    <p className="text-muted">Загрузка адвокатов...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-5">
                <div className="text-center mb-5 animate-fadeInUp">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style={{ width: '70px', height: '70px' }}>
                        <span className="fs-1">👨‍⚖️</span>
                    </div>
                    <h1 className="display-5 fw-bold mb-2">Наши адвокаты</h1>
                    <p className="text-muted">Профессионалы с многолетним опытом</p>
                </div>

                {/* Поиск и фильтры */}
                <div className="row g-3 mb-5">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Поиск по имени..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                        >
                            <option value="">Все специализации</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Результаты */}
                {filteredLawyers.length === 0 ? (
                    <div className="text-center py-5">
                        <span className="display-1 opacity-25">👨‍⚖️</span>
                        <p className="text-muted mt-3">Адвокаты не найдены</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredLawyers.map((lawyer, index) => (
                            <div key={lawyer.id} className="col-md-6 col-lg-4">
                                <div
                                    className="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift h-100"
                                    style={{ cursor: 'pointer', minHeight: '400px' }}
                                    onClick={() => openModal(lawyer)}
                                >
                                    <div className="card-body p-4 text-center d-flex flex-column h-100">
                                        <div className="mb-3">
                                            {lawyer.photo ? (
                                                <img
                                                    src={lawyer.photo}
                                                    className="rounded-circle object-fit-cover border border-3 border-primary"
                                                    alt={lawyer.full_name || lawyer.username}
                                                    style={{ width: '100px', height: '100px' }}
                                                />
                                            ) : (
                                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '100px', height: '100px' }}>
                                                    <span className="fs-1">⚖️</span>
                                                </div>
                                            )}
                                        </div>
                                        <h5 className="fw-bold mb-1">{lawyer.full_name || lawyer.username}</h5>
                                        <p className="text-primary small mb-2">{lawyer.specialization}</p>
                                        <div className="mb-2">
                                            <span className="text-warning">{renderStars(Number(lawyer.rating) || 0)}</span>
                                            <span className="text-muted small ms-1">({lawyer.rating || 0})</span>
                                        </div>
                                        <p className="text-muted small mb-2">📅 {lawyer.experience} лет опыта</p>
                                        {lawyer.bio && (
                                            <p className="text-muted small flex-grow-1">
                                                {lawyer.bio.slice(0, 80)}...
                                            </p>
                                        )}
                                        <div className="mt-auto">
                                            <button
                                                className="btn btn-primary rounded-pill px-4 w-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConsultation();
                                                }}
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

            {/* Модальное окно для полного описания */}
            {selectedLawyer && (
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
                                {selectedLawyer.photo ? (
                                    <img
                                        src={selectedLawyer.photo}
                                        className="rounded-circle object-fit-cover border border-3 border-primary"
                                        alt={selectedLawyer.full_name || selectedLawyer.username}
                                        style={{ width: '120px', height: '120px' }}
                                    />
                                ) : (
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '120px', height: '120px' }}>
                                        <span className="fs-1">⚖️</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="fw-bold text-center mb-1">{selectedLawyer.full_name || selectedLawyer.username}</h3>
                            <p className="text-primary text-center mb-2">{selectedLawyer.specialization}</p>
                            <div className="text-center mb-3">
                                <span className="text-warning fs-5">{renderStars(Number(selectedLawyer.rating) || 0)}</span>
                                <span className="text-muted ms-2">({selectedLawyer.rating || 0})</span>
                            </div>
                            <div className="mb-3 text-center">
                                <span className="badge bg-primary rounded-pill px-3 py-2">📅 {selectedLawyer.experience} лет опыта</span>
                            </div>
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-2">О себе:</h6>
                                <p className="text-muted">{selectedLawyer.bio}</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1 rounded-pill"
                                    onClick={() => {
                                        closeModal();
                                        handleConsultation();
                                    }}
                                >
                                    Записаться на консультацию
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

export default Lawyers;