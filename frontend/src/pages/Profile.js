import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (avatar) {
            const formDataAvatar = new FormData();
            formDataAvatar.append('avatar', avatar);
            try {
                await api.patch('/auth/profile/', formDataAvatar, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } catch (error) {
                setMessage('Ошибка загрузки аватара');
            }
        }

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage('Профиль успешно обновлён');
        } else {
            setMessage('Ошибка обновления: ' + result.error);
        }

        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    };

    // Получаем инициалы для аватара по умолчанию
    const getInitials = () => {
        const first = user?.first_name?.charAt(0) || '';
        const last = user?.last_name?.charAt(0) || '';
        if (first && last) return `${first}${last}`;
        if (first) return first;
        if (user?.username) return user.username.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-header bg-primary text-white rounded-top-4">
                        <h3 className="text-center mb-0">Мой профиль</h3>
                    </div>
                    <div className="card-body p-4">
                        {message && (
                            <div className={`alert ${message.includes('успешно') ? 'alert-success' : 'alert-danger'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Аватар - улучшенный вид */}
                            <div className="text-center mb-4">
                                <div className="position-relative d-inline-block">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            className="rounded-circle border border-3 border-primary shadow-sm"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                            alt="Avatar"
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                            }}
                                        >
                                            <span style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>
                                                {getInitials()}
                                            </span>
                                        </div>
                                    )}
                                    <label
                                        htmlFor="avatar-upload"
                                        className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle shadow-sm"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid white'
                                        }}
                                    >
                                        📷
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <p className="text-muted small mt-2">Нажмите на иконку 📷 чтобы загрузить фото</p>
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
                                        placeholder="Введите имя"
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
                                        placeholder="Введите фамилию"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control rounded-3"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@mail.ru"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Телефон</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="form-control rounded-3"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+7 (xxx) xxx-xx-xx"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">О себе</label>
                                <textarea
                                    name="bio"
                                    className="form-control rounded-3"
                                    rows="4"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Расскажите немного о себе..."
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Тип пользователя</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    value={user?.user_type === 'client' ? 'Клиент' : 'Адвокат'}
                                    disabled
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-semibold" disabled={loading}>
                                {loading ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;