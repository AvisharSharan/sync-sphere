import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, loading, error, user, clearError } = useAuthStore();

  // Derive active tab from URL
  const isLogin = location.pathname !== '/register';
  const [tab, setTab] = useState(isLogin ? 'login' : 'register');

  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/chat');
  }, [user, navigate]);

  useEffect(() => {
    clearError();
    setTab(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname, clearError]);

  const switchTab = (t) => {
    clearError();
    setTab(t);
    navigate(t === 'login' ? '/login' : '/register', { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(regData.name, regData.email, regData.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1>SyncSphere</h1>
          <p>Connect, collaborate, communicate</p>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
            <div className="auth-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={loginData.remember}
                  onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="auth-link-btn">Forgot password?</button>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" className="auth-link-btn bold" onClick={() => switchTab('register')}>
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your name"
              value={regData.name}
              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              required
              autoComplete="name"
            />
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={regData.email}
              onChange={(e) => setRegData({ ...regData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={regData.password}
              onChange={(e) => setRegData({ ...regData, password: e.target.value })}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="auth-switch">
              Already have an account?
              <button type="button" className="auth-link-btn bold" onClick={() => switchTab('login')}>
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
