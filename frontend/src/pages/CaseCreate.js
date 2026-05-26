import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function CaseCreate() {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        service: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchServices();
    }, [isAuthenticated, navigate]);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services/');
            setServices(response.data.results || response.data);
        } catch (error) {
            console.error('Ошибка загрузки услуг:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/cases/', formData);
            navigate(`/cases/${response.data.id}`);
        } catch (error) {
            setError(error.response?.data?.detail || 'Ошибка создания заявки');
            setLoading(false);
        }
    };

    const selectedService = services.find(s => s.id == formData.service);

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Карточка формы */}
                        <div className="card border-0 rounded-4 shadow-2xl overflow-hidden">
                            {/* Декоративная полоса */}
                            <div className="bg-gradient-primary" style={{ height: '6px', background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)' }}></div>

                            <div className="card-body p-0">
                                <div className="row g-0">
                                    {/* Левая часть - изображение/инфо */}
                                    <div className="col-md-5 bg-gradient-dark text-white p-5" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <span className="display-1">⚖️</span>
                                            </div>
                                            <h3 className="fw-bold mb-3">LexExpect</h3>
                                            <p className="opacity-75 mb-4">Профессиональная юридическая помощь</p>
                                            <hr className="opacity-25 my-4" />
                                            <div className="text-start small">
                                                <div className="mb-2">
                                                    <span className="me-2">✓</span> Быстрое рассмотрение
                                                </div>
                                                <div className="mb-2">
                                                    <span className="me-2">✓</span> Опытные адвокаты
                                                </div>
                                                <div className="mb-2">
                                                    <span className="me-2">✓</span> Прозрачные цены
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Правая часть - форма */}
                                    <div className="col-md-7 p-5">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="fw-bold mb-0">Новая заявка</h3>
                                            <button
                                                className="btn btn-link text-decoration-none text-muted"
                                                onClick={() => navigate('/cases')}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {error && (
                                            <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 mb-4">
                                                <span>⚠️</span> {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold mb-2">
                                                    Тема обращения
                                                </label>
                                                <div className="position-relative">
                                                    <span className="position-absolute start-0 top-50 translate-middle-y ms-3 opacity-50">📌</span>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        className="form-control form-control-lg rounded-3 ps-5 border-0 bg-light"
                                                        placeholder="Кратко опишите суть..."
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold mb-2">
                                                    Выберите услугу
                                                </label>
                                                <div className="position-relative">
                                                    <span className="position-absolute start-0 top-50 translate-middle-y ms-3 opacity-50">⚖️</span>
                                                    <select
                                                        name="service"
                                                        className="form-select form-select-lg rounded-3 ps-5 border-0 bg-light"
                                                        value={formData.service}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ appearance: 'none', cursor: 'pointer' }}
                                                    >
                                                        <option value="">Выберите услугу</option>
                                                        {services.map((service) => (
                                                            <option key={service.id} value={service.id}>
                                                                {service.title} — {service.price.toLocaleString()} ₽
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {selectedService && (
                                                <div className="bg-gradient-success rounded-3 p-3 mb-4" style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <small className="text-success fw-semibold">Выбрано</small>
                                                            <div className="fw-semibold">{selectedService.title}</div>
                                                        </div>
                                                        <div className="text-end">
                                                            <small className="text-success">Стоимость</small>
                                                            <div className="fw-bold text-success fs-5">{selectedService.price.toLocaleString()} ₽</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold mb-2">
                                                    Описание проблемы
                                                </label>
                                                <textarea
                                                    name="description"
                                                    className="form-control rounded-3 border-0 bg-light"
                                                    rows="4"
                                                    placeholder="Опишите вашу ситуацию подробно..."
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                                <div className="d-flex justify-content-end mt-1">
                                                    <small className="text-muted">{formData.description.length} символов</small>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn w-100 py-3 rounded-3 text-white fw-semibold"
                                                disabled={loading}
                                                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Отправка...
                                                    </>
                                                ) : (
                                                    '✉️ Отправить заявку'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CaseCreate;