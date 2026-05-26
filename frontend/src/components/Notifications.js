import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websocketService from '../services/websocket';
import { useAuth } from '../context/AuthContext';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);
    const lastNotificationRef = useRef(null);
    const { user, isAuthenticated } = useAuth();

    // Загрузка уведомлений из localStorage
    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`notifications_${user.id}`);
            if (saved) {
                try {
                    setNotifications(JSON.parse(saved));
                } catch (e) {
                    console.error('Ошибка загрузки уведомлений:', e);
                }
            }
        }
    }, [user]);

    // Сохранение уведомлений в localStorage
    useEffect(() => {
        if (user && notifications.length > 0) {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
        }
    }, [notifications, user]);

    // Закрытие при клике вне области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShow(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        websocketService.connect();

        const handleNotification = (data) => {
            console.log('Получено уведомление:', data);

            // Только уведомления о заявках
            let title = '';
            let message = '';
            let caseId = null;

            if (data.type === 'case_status_changed') {
                title = '📌 Статус заявки изменён';
                message = data.message;
                caseId = data.case_id;
            } else if (data.type === 'new_case_available') {
                title = '📋 Новая заявка!';
                message = data.message;
                caseId = data.case_id;
            } else if (data.type === 'connected') {
                console.log('WebSocket соединение установлено');
                return;
            } else {
                // Игнорируем другие типы уведомлений (отзывы и т.д.)
                return;
            }

            if (title) {
                const notificationKey = `${caseId}_${title}`;
                if (lastNotificationRef.current === notificationKey) {
                    return;
                }
                lastNotificationRef.current = notificationKey;
                setTimeout(() => {
                    lastNotificationRef.current = null;
                }, 3000);

                const newNotification = {
                    id: `${caseId}_${Date.now()}_${Math.random()}`,
                    title: title,
                    message: message,
                    caseId: caseId,
                    timestamp: new Date(data.timestamp || Date.now()),
                    read: false
                };

                setNotifications(prev => [newNotification, ...prev].slice(0, 50));

                // Push-уведомление только если окно не активно
                if (Notification.permission === 'granted' && document.hidden) {
                    new Notification('LexExpect', {
                        body: message,
                        icon: '/favicon.svg'
                    });
                }
            }
        };

        websocketService.addListener(handleNotification);

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            websocketService.removeListener(handleNotification);
        };
    }, [isAuthenticated]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const clearAll = () => {
        if (window.confirm('Очистить все уведомления?')) {
            setNotifications([]);
            if (user) {
                localStorage.removeItem(`notifications_${user.id}`);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!isAuthenticated) return null;

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn btn-outline-light btn-sm position-relative rounded-circle"
                onClick={() => setShow(!show)}
                style={{ width: '35px', height: '35px' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div
                    className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg"
                    style={{ width: '350px', zIndex: 1050, top: '100%' }}
                >
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-semibold">Уведомления</h6>
                        <div>
                            {unreadCount > 0 && (
                                <button
                                    className="btn btn-sm btn-link text-decoration-none p-0 me-2"
                                    onClick={markAllAsRead}
                                    style={{ fontSize: '12px' }}
                                >
                                    Прочитать всё
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    className="btn btn-sm btn-link text-decoration-none p-0 text-danger"
                                    onClick={clearAll}
                                    style={{ fontSize: '12px' }}
                                >
                                    Очистить
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <span className="d-block mb-2">🔔</span>
                                Нет уведомлений
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <strong className="small">{notif.title}</strong>
                                        <small className="text-muted ms-2" style={{ fontSize: '10px' }}>
                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </div>
                                    <p className="small mb-1 mt-1">{notif.message}</p>
                                    {notif.caseId && (
                                        <Link
                                            to={`/cases/${notif.caseId}`}
                                            className="small text-decoration-none"
                                            onClick={() => setShow(false)}
                                        >
                                            Перейти к заявке →
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;