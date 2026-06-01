import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function CaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFullReview, setShowFullReview] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [error, setError] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        fetchCase();
    }, [id]);

    const fetchCase = async () => {
        try {
            const response = await api.get(`/cases/${id}/`);
            setCaseData(response.data);
        } catch (error) {
            if (error.response?.status === 404) navigate('/cases');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        try {
            await api.patch(`/cases/${id}/update_status/`, { status: newStatus });
            await fetchCase();
        } catch (error) {
            setError(error.response?.data?.error || 'Ошибка');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Удалить заявку?')) {
            await api.delete(`/cases/${id}/`);
            navigate('/cases');
        }
    };

    const handleAcceptCase = async () => {
        if (window.confirm('Принять заявку?')) {
            setAcceptLoading(true);
            try {
                await api.post(`/cases/${id}/accept_case/`);
                alert('✅ Заявка принята!');
                await fetchCase();
            } catch (error) {
                setError(error.response?.data?.error || 'Ошибка');
            } finally {
                setAcceptLoading(false);
            }
        }
    };

    const handleRejectCase = async () => {
        if (window.confirm('Вы уверены, что хотите отклонить эту заявку?')) {
            setRejectLoading(true);
            setError('');
            try {
                const response = await api.post(`/cases/${id}/reject_case/`);

                if (response.data.status === 'rejected_final') {
                    alert('❌ Все адвокаты отклонили заявку. Заявка отклонена окончательно.');
                    navigate('/cases');
                } else {
                    alert(`✅ Вы отклонили заявку. Она осталась видна другим адвокатам. (Осталось адвокатов: ${response.data.remaining_lawyers})`);
                    await fetchCase();
                }
            } catch (error) {
                setError(error.response?.data?.error || 'Ошибка при отклонении заявки');
            } finally {
                setRejectLoading(false);
            }
        }
    };

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ ОТЗЫВА
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        setError('');
        try {
            const response = await api.post('/reviews/', {
                case: Number(id),           // ← ИЗМЕНЕНО: case (не case_id) и Number()
                rating: Number(reviewRating),
                text: reviewText
            });
            console.log('Ответ сервера:', response.data);
            alert('✅ Отзыв отправлен! Спасибо за вашу оценку.');
            setReviewText('');
            setReviewRating(5);
            await fetchCase();
        } catch (error) {
            console.error('Ошибка:', error.response?.data);
            const errorData = error.response?.data;
            let errorMessage = 'Ошибка отправки отзыва';
            if (errorData?.case) errorMessage = errorData.case;
            else if (errorData?.status) errorMessage = errorData.status;
            else if (errorData?.user) errorMessage = errorData.user;
            else if (errorData?.lawyer) errorMessage = errorData.lawyer;
            else if (typeof errorData === 'string') errorMessage = errorData;
            setError(errorMessage);
        } finally {
            setReviewLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'new': { text: '🆕 НОВАЯ', bg: '#6c757d' },
            'accepted': { text: '✅ ПРИНЯТА', bg: '#198754' },
            'in_progress': { text: '⚙️ В РАБОТЕ', bg: '#0dcaf0' },
            'completed': { text: '🎉 ЗАВЕРШЕНА', bg: '#198754' },
            'rejected': { text: '❌ ОТКЛОНЕНА', bg: '#dc3545' },
            'cancelled': { text: '🚫 ОТМЕНЕНА', bg: '#dc3545' }
        };
        const s = map[status] || { text: status, bg: '#6c757d' };
        return <span className="badge rounded-pill text-white px-2 py-1" style={{ backgroundColor: s.bg, fontSize: '10px' }}>{s.text}</span>;
    };

    if (loading) return <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>;
    if (!caseData) return <div className="text-center py-4"><h5>Заявка не найдена</h5><button className="btn btn-primary mt-2" onClick={() => navigate('/cases')}>Назад</button></div>;

    const description = caseData.description || '';
    const shortDescription = description.length > 150 ? description.slice(0, 150) + '...' : description;
    const reviewTextContent = caseData.review?.text || '';
    const shortReview = reviewTextContent.length > 100 ? reviewTextContent.slice(0, 100) + '...' : reviewTextContent;

    const canEdit = user?.id === caseData.client?.id && caseData.status === 'new';
    const canChangeStatus = (caseData.lawyer?.user_id === user?.id) || isAdmin;
    const canAcceptReject = user?.user_type === 'lawyer' && caseData.status === 'new' && caseData.client?.id !== user?.id;
    const showReviewForm = caseData.status === 'completed' && !caseData.review && user?.id === caseData.client?.id;

    return (
        <div className="bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-3">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <button className="btn btn-outline-primary rounded-pill px-3 py-1 mb-3" onClick={() => navigate('/cases')}>
                            ← Назад
                        </button>

                        {error && (
                            <div className={`alert ${error.includes('✅') ? 'alert-success' : 'alert-danger'} py-2 mb-3`}>
                                {error}
                                <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
                            </div>
                        )}

                        {/* Основная карточка */}
                        <div className="card border-0 shadow-sm rounded-3 mb-3">
                            <div className="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Заявка #{caseData.id}</h5>
                                {getStatusBadge(caseData.status)}
                            </div>
                            <div className="card-body p-3">
                                <h5 className="fw-bold mb-2">{caseData.title}</h5>
                                <div className="row g-2 mb-2">
                                    <div className="col-sm-6"><span className="text-muted small">📋 Услуга:</span> {caseData.service?.title || '-'}</div>
                                    <div className="col-sm-6"><span className="text-muted small">👤 Клиент:</span> {caseData.client?.username || '-'}</div>
                                    <div className="col-sm-6"><span className="text-muted small">⚖️ Адвокат:</span> {caseData.lawyer?.full_name || 'Не назначен'}</div>
                                    <div className="col-sm-6"><span className="text-muted small">💰 Стоимость:</span> <span className="fw-bold text-primary">{caseData.service?.price?.toLocaleString()} ₽</span></div>
                                    <div className="col-sm-6"><span className="text-muted small">📅 Создана:</span> {new Date(caseData.created_at).toLocaleDateString()}</div>
                                    {caseData.updated_at !== caseData.created_at && <div className="col-sm-6"><span className="text-muted small">🔄 Обновлена:</span> {new Date(caseData.updated_at).toLocaleDateString()}</div>}
                                </div>

                                <div className="mt-2 pt-2 border-top">
                                    <div className="small fw-semibold mb-1">📝 Описание:</div>
                                    <p className="small mb-0" style={{ lineHeight: '1.4' }}>
                                        {showFullDescription ? description : shortDescription}
                                    </p>
                                    {description.length > 150 && (
                                        <button className="btn btn-link btn-sm p-0 mt-1 text-primary text-decoration-none" onClick={() => setShowFullDescription(!showFullDescription)} style={{ fontSize: '11px' }}>
                                            {showFullDescription ? 'Скрыть' : 'Показать полностью'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {canAcceptReject && (
                            <div className="d-flex gap-2 justify-content-center mb-3">
                                <button className="btn btn-success btn-sm px-3 rounded-pill" onClick={handleAcceptCase} disabled={acceptLoading}>✅ Принять</button>
                                <button className="btn btn-danger btn-sm px-3 rounded-pill" onClick={handleRejectCase} disabled={rejectLoading}>❌ Отклонить</button>
                            </div>
                        )}

                        {canChangeStatus && caseData.status !== 'completed' && caseData.status !== 'cancelled' && caseData.status !== 'rejected' && (
                            <div className="d-flex gap-2 justify-content-center flex-wrap mb-3">
                                {caseData.status === 'accepted' && <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => handleStatusChange('in_progress')}>▶️ Начать работу</button>}
                                {caseData.status === 'in_progress' && <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleStatusChange('completed')}>✅ Завершить</button>}
                                {(caseData.status === 'accepted' || caseData.status === 'in_progress') && <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => handleStatusChange('cancelled')}>❌ Отменить</button>}
                            </div>
                        )}

                        {canEdit && (
                            <div className="text-end mb-3">
                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleDelete}>🗑️ Удалить</button>
                            </div>
                        )}

                        {showReviewForm && (
                            <div className="card border-0 shadow-sm rounded-3 mb-3">
                                <div className="card-header bg-warning py-1 px-3"><h6 className="mb-0 small">⭐ Оставить отзыв</h6></div>
                                <div className="card-body p-2">
                                    <form onSubmit={handleReviewSubmit}>
                                        <select className="form-select form-select-sm mb-2" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                                            <option value="5">⭐⭐⭐⭐⭐ 5 - Отлично</option>
                                            <option value="4">⭐⭐⭐⭐☆ 4 - Хорошо</option>
                                            <option value="3">⭐⭐⭐☆☆ 3 - Нормально</option>
                                            <option value="2">⭐⭐☆☆☆ 2 - Плохо</option>
                                            <option value="1">⭐☆☆☆☆ 1 - Ужасно</option>
                                        </select>
                                        <textarea className="form-control form-control-sm mb-2" rows="2" placeholder="Ваш отзыв..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required></textarea>
                                        <button type="submit" className="btn btn-primary btn-sm w-100 rounded-pill" disabled={reviewLoading}>✉️ Отправить</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {caseData.review && (
                            <div className="card border-0 shadow-sm rounded-3 mt-2">
                                <div className="card-header bg-light py-1 px-3"><h6 className="mb-0 small">⭐ Отзыв</h6></div>
                                <div className="card-body p-2">
                                    <div className="d-flex align-items-center">
                                        <span className="text-warning me-1" style={{ fontSize: '12px' }}>
                                            {'★'.repeat(caseData.review.rating)}{'☆'.repeat(5 - caseData.review.rating)}
                                        </span>
                                        <small className="text-muted">({caseData.review.rating})</small>
                                    </div>
                                    <p className="small mb-0 mt-1" style={{ lineHeight: '1.3' }}>
                                        {showFullReview ? reviewTextContent : shortReview}
                                    </p>
                                    {reviewTextContent.length > 100 && (
                                        <button className="btn btn-link btn-sm p-0 mt-1 text-primary text-decoration-none" onClick={() => setShowFullReview(!showFullReview)} style={{ fontSize: '11px' }}>
                                            {showFullReview ? 'Скрыть' : 'Показать полностью'}
                                        </button>
                                    )}
                                    <small className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>
                                        📅 {new Date(caseData.review.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CaseDetail;