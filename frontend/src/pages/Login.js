import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Очищаем ошибку при размонтировании
    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        clearError();
        setLoading(true);

        const result = await login({ username, password });

        if (result.success) {
            navigate('/');
        } else {
            setLocalError(result.error);
            setLoading(false);
        }
    };

    // Отображаем ошибку из контекста или локальную
    const displayError = localError || error;

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-header bg-primary text-white rounded-top-4">
                        <h3 className="text-center mb-0">Вход в систему</h3>
                    </div>
                    <div className="card-body p-4">
                        {displayError && (
                            <div className="alert alert-danger alert-dismissible fade show rounded-3 d-flex align-items-center justify-content-between" role="alert">
                                <div className="d-flex align-items-center">
                                    <span className="me-2 fs-5">⚠️</span>
                                    <span>{displayError}</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setLocalError('');
                                        clearError();
                                    }}
                                ></button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Имя пользователя</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg rounded-3"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Пароль</label>
                                <div className="position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control form-control-lg rounded-3 pe-5"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ outline: 'none', boxShadow: 'none', cursor: 'pointer' }}
                                    >
                                        {showPassword ? (
                                            <span style={{ fontSize: '20px' }}>🙈</span>
                                        ) : (
                                            <span style={{ fontSize: '20px' }}>👁️</span>
                                        )}
                                    </button>
                                </div>
                                <small className="text-muted">
                                    {showPassword ? '👁️ Пароль виден' : '🙈 Пароль скрыт'}
                                </small>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Вход...
                                    </>
                                ) : (
                                    'Войти'
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <Link to="/register">Нет аккаунта? Зарегистрируйтесь</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;