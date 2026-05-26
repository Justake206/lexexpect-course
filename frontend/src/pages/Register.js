import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        user_type: 'client'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Очищаем ошибку при изменении полей
        setLocalError('');
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        clearError();

        if (formData.password !== formData.password2) {
            setLocalError('Пароли не совпадают');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/');
        } else {
            setLocalError(result.error);
            setLoading(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-header bg-primary text-white rounded-top-4">
                        <h3 className="text-center mb-0">Регистрация</h3>
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
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Имя пользователя *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control rounded-3"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control rounded-3"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Имя</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control rounded-3"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Фамилия</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control rounded-3"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Тип пользователя</label>
                                <select
                                    name="user_type"
                                    className="form-select rounded-3"
                                    value={formData.user_type}
                                    onChange={handleChange}
                                >
                                    <option value="client">Клиент</option>
                                    <option value="lawyer">Адвокат</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Пароль *</label>
                                <div className="position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-control rounded-3 pe-5"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                <small className="text-muted">Минимум 6 символов</small>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Подтверждение пароля *</label>
                                <div className="position-relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password2"
                                        className="form-control rounded-3 pe-5"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ outline: 'none', boxShadow: 'none', cursor: 'pointer' }}
                                    >
                                        {showConfirmPassword ? (
                                            <span style={{ fontSize: '20px' }}>🙈</span>
                                        ) : (
                                            <span style={{ fontSize: '20px' }}>👁️</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Регистрация...
                                    </>
                                ) : (
                                    'Зарегистрироваться'
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <Link to="/login">Уже есть аккаунт? Войдите</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;