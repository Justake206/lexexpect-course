import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.custom-dropdown')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center gap-2" to="/">
                    <span style={{ fontSize: '28px' }}>⚖️</span>
                    <span>LexExpect</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Главная</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/services">Услуги</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/lawyers">Адвокаты</Link>
                        </li>
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/cases">Мои заявки</Link>
                            </li>
                        )}
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/favorites">
                                    ❤️ Избранное
                                </Link>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={toggleTheme}
                                    className="btn btn-outline-light btn-sm rounded-circle"
                                    style={{ width: '35px', height: '35px', fontSize: '16px' }}
                                    title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
                                >
                                    {isDarkMode ? '☀️' : '🌙'}
                                </button>
                                <Notifications />

                                <div className="custom-dropdown" style={{ position: 'relative' }}>
                                    <button
                                        onClick={toggleDropdown}
                                        className="btn btn-light btn-sm d-flex align-items-center gap-2"
                                        style={{ borderRadius: '30px', padding: '5px 15px' }}
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                className="rounded-circle"
                                                alt="avatar"
                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#0d6efd',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="fw-semibold">
                                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                                        </span>
                                        <span style={{ fontSize: '12px' }}>{dropdownOpen ? '▲' : '▼'}</span>
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            className="dropdown-menu-custom"
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '8px',
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                minWidth: '180px',
                                                zIndex: 1000,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Link
                                                to="/profile"
                                                className="dropdown-item-custom"
                                                onClick={() => setDropdownOpen(false)}
                                                style={{
                                                    display: 'block',
                                                    padding: '10px 16px',
                                                    color: '#333',
                                                    textDecoration: 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                👤 Профиль
                                            </Link>
                                            <div style={{ height: '1px', background: '#eee', margin: '4px 0' }}></div>
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item-custom"
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '10px 16px',
                                                    color: '#dc3545',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                🚪 Выйти
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="d-flex gap-2 align-items-center">
                                <button
                                    onClick={toggleTheme}
                                    className="btn btn-outline-light btn-sm rounded-circle"
                                    style={{ width: '35px', height: '35px', fontSize: '16px' }}
                                    title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
                                >
                                    {isDarkMode ? '☀️' : '🌙'}
                                </button>
                                <Link to="/login" className="btn btn-outline-light btn-sm">
                                    Вход
                                </Link>
                                <Link to="/register" className="btn btn-light btn-sm">
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;