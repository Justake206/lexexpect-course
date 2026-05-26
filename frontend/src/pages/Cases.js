import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Cases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await api.get('/cases/');
            setCases(response.data.results || response.data);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            'new': { text: 'Новая', color: '#6c757d', icon: '🆕', bg: '#f8f9fa' },
            'pending': { text: 'На рассмотрении', color: '#ffc107', icon: '⏳', bg: '#fff3cd' },
            'accepted': { text: 'Принята', color: '#198754', icon: '✅', bg: '#d1e7dd' },
            'rejected': { text: 'Отклонена', color: '#dc3545', icon: '❌', bg: '#f8d7da' },
            'in_progress': { text: 'В работе', color: '#0dcaf0', icon: '⚙️', bg: '#e0f7fa' },
            'completed': { text: 'Завершена', color: '#198754', icon: '🎉', bg: '#d1e7dd' },
            'cancelled': { text: 'Отменена', color: '#dc3545', icon: '🚫', bg: '#f8d7da' }
        };
        return config[status] || config['new'];
    };

    const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status === filter);
    const stats = {
        all: cases.length,
        new: cases.filter(c => c.status === 'new').length,
        in_progress: cases.filter(c => c.status === 'in_progress').length,
        completed: cases.filter(c => c.status === 'completed').length
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted">Загрузка заявок...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4">
                {/* Шапка */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-6 fw-bold mb-1">Мои заявки</h1>
                        <p className="text-muted small">Все ваши обращения</p>
                    </div>
                    <Link to="/cases/create" className="btn btn-primary rounded-pill px-4">
                        + Новая заявка
                    </Link>
                </div>

                {/* Быстрая статистика */}
                <div className="d-flex gap-3 mb-4 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn-sm rounded-pill px-3 ${filter === 'all' ? 'btn-primary' : 'btn-light'}`}
                    >
                        Все <span className="badge bg-secondary bg-opacity-25 ms-1">{stats.all}</span>
                    </button>
                    {stats.new > 0 && (
                        <button
                            onClick={() => setFilter('new')}
                            className={`btn btn-sm rounded-pill px-3 ${filter === 'new' ? 'btn-primary' : 'btn-light'}`}
                        >
                            🆕 Новые <span className="badge bg-secondary bg-opacity-25 ms-1">{stats.new}</span>
                        </button>
                    )}
                    {stats.in_progress > 0 && (
                        <button
                            onClick={() => setFilter('in_progress')}
                            className={`btn btn-sm rounded-pill px-3 ${filter === 'in_progress' ? 'btn-primary' : 'btn-light'}`}
                        >
                            ⚙️ В работе <span className="badge bg-secondary bg-opacity-25 ms-1">{stats.in_progress}</span>
                        </button>
                    )}
                    {stats.completed > 0 && (
                        <button
                            onClick={() => setFilter('completed')}
                            className={`btn btn-sm rounded-pill px-3 ${filter === 'completed' ? 'btn-primary' : 'btn-light'}`}
                        >
                            ✅ Завершены <span className="badge bg-secondary bg-opacity-25 ms-1">{stats.completed}</span>
                        </button>
                    )}
                </div>

                {/* Список заявок */}
                {filteredCases.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                        <div className="card-body">
                            <span className="display-1 mb-3 d-block opacity-25">📭</span>
                            <h5 className="text-muted mb-2">У вас пока нет заявок</h5>
                            <p className="text-muted small">Создайте первую заявку</p>
                            <Link to="/cases/create" className="btn btn-primary rounded-pill px-4 mt-2">
                                + Создать заявку
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="list-group">
                        {filteredCases.map((caseItem) => {
                            const statusConfig = getStatusConfig(caseItem.status);
                            return (
                                <Link
                                    key={caseItem.id}
                                    to={`/cases/${caseItem.id}`}
                                    className="list-group-item list-group-item-action border-0 shadow-sm rounded-3 mb-2 p-3 text-decoration-none"
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                                <span className="fw-bold text-primary">#{caseItem.id}</span>
                                                <span
                                                    className="badge rounded-pill px-2 py-1"
                                                    style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                                                >
                                                    {statusConfig.icon} {statusConfig.text}
                                                </span>
                                                <span className="text-muted small ms-auto">
                                                    📅 {new Date(caseItem.created_at).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                            <div className="fw-semibold mb-1">{caseItem.title}</div>
                                            <div className="d-flex gap-3">
                                                <span className="small text-muted">
                                                    📋 {caseItem.service_title}
                                                </span>
                                                {caseItem.lawyer_name && (
                                                    <span className="small text-muted">
                                                        ⚖️ {caseItem.lawyer_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-muted ms-3">→</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cases;