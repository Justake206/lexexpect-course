import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { isAuthenticated } = useAuth();

    const features = [
        { icon: '⚖️', title: 'Профессиональные юристы', desc: 'Опытные адвокаты с многолетней практикой' },
        { icon: '📝', title: 'Прозрачные цены', desc: 'Фиксированная стоимость услуг без скрытых платежей' },
        { icon: '⚡', title: 'Быстрое решение', desc: 'Оперативная обработка заявок и обратная связь' },
        { icon: '🔒', title: 'Конфиденциальность', desc: 'Гарантия сохранности ваших данных' }
    ];

    const services = [
        { title: 'Консультация юриста', price: '2 000 ₽', duration: '30-60 мин', icon: '💬' },
        { title: 'Составление договора', price: '5 000 ₽', duration: '1-2 дня', icon: '📄' },
        { title: 'Представительство в суде', price: '15 000 ₽', duration: 'от 1 месяца', icon: '⚖️' }
    ];

    return (
        <div className="animate-fadeInUp">
            {/* Hero секция */}
            <div className="position-relative text-white py-5" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <div className="container py-5 text-center">
                    <div className="mb-4">
                        <span className="display-1">⚖️</span>
                    </div>
                    <h1 className="display-3 fw-bold mb-3">LexExpect</h1>
                    <p className="lead mb-4 opacity-90">Профессиональная юридическая помощь онлайн</p>
                    <div className="d-flex justify-content-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/register" className="btn btn-light btn-lg rounded-pill px-5 fw-semibold">
                                    Начать
                                </Link>
                                <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-5">
                                    Войти
                                </Link>
                            </>
                        ) : (
                            <Link to="/services" className="btn btn-light btn-lg rounded-pill px-5 fw-semibold">
                                Выбрать услугу
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-light">
                <div className="container py-5">
                    {/* Преимущества */}
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-3">Почему выбирают нас?</h2>
                        <p className="text-muted">Мы заботимся о каждом клиенте</p>
                        <div className="border-bottom w-25 mx-auto mt-3" style={{ borderColor: '#667eea' }}></div>
                    </div>

                    <div className="row g-4 mb-5">
                        {features.map((feature, index) => (
                            <div key={index} className="col-md-6 col-lg-3">
                                <div className="card border-0 shadow-sm rounded-4 text-center p-4 h-100 hover-lift animate-scaleIn">
                                    <div className="mb-3">
                                        <span className="display-4">{feature.icon}</span>
                                    </div>
                                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                                    <p className="text-muted small mb-0">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Популярные услуги */}
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-3">Популярные услуги</h2>
                        <p className="text-muted">Выберите подходящее решение</p>
                        <div className="border-bottom w-25 mx-auto mt-3" style={{ borderColor: '#667eea' }}></div>
                    </div>

                    <div className="row g-4 mb-5">
                        {services.map((service, index) => (
                            <div key={index} className="col-md-4">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 hover-lift animate-scaleIn">
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <span className="display-3">{service.icon}</span>
                                        </div>
                                        <h5 className="fw-bold mb-2">{service.title}</h5>
                                        <div className="mb-2">
                                            <span className="h4 text-primary fw-bold">{service.price}</span>
                                        </div>
                                        <p className="text-muted small mb-3">⏱️ {service.duration}</p>
                                        <Link to={isAuthenticated ? "/cases/create" : "/register"}
                                              className="btn btn-outline-primary rounded-pill px-4 w-100">
                                            {isAuthenticated ? 'Заказать' : 'Зарегистрироваться'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA секция */}
                    <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <div className="card-body p-5 text-center text-white">
                            <h3 className="fw-bold mb-3">Нужна юридическая помощь?</h3>
                            <p className="mb-4 opacity-90">Оставьте заявку, и мы свяжемся с вами в ближайшее время</p>
                            <Link to={isAuthenticated ? "/cases/create" : "/register"}
                                  className="btn btn-light rounded-pill px-5 py-2 fw-semibold">
                                {isAuthenticated ? 'Создать заявку' : 'Зарегистрироваться'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;