import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      onNavigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@jobtrack.io');
    setPassword('demo1234');
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-dot">●</span>
          <span className="auth-wordmark">JobTrack</span>
        </div>

        <h1 className="auth-heading">Sign in</h1>
        <p className="auth-sub">Track every application, interview, and offer — in one place.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrap">
              <Mail size={14} className="auth-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              <button
                type="button"
                className="forgot-btn"
                onClick={() => onNavigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-icon" />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
            {!loading && <ArrowRight size={15} />}
          </button>

          <button type="button" className="demo-btn" onClick={fillDemo}>
            Use demo credentials
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <button className="auth-link" onClick={() => onNavigate('/register')}>
            Create one
          </button>
        </div>
      </div>

      <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #0f0f0f;
        }
        .auth-shell {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
        }
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 32px;
        }
        .auth-dot {
          font-size: 10px;
          color: #c8956c;
          line-height: 1;
        }
        .auth-wordmark {
          font-size: 14px;
          font-weight: 600;
          color: #edebe6;
          letter-spacing: -0.01em;
        }
        .auth-heading {
          font-size: 26px;
          font-weight: 600;
          color: #edebe6;
          letter-spacing: -0.025em;
          margin-bottom: 6px;
          line-height: 1.1;
        }
        .auth-sub {
          font-size: 13px;
          color: #5a5552;
          line-height: 1.5;
          margin-bottom: 32px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .auth-label {
          font-size: 12px;
          font-weight: 500;
          color: #8a8480;
        }
        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .auth-input-wrap {
          position: relative;
        }
        .auth-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #4a4846;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          padding: 9px 12px 9px 32px;
          background: #161616;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 7px;
          color: #edebe6;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.14s ease;
        }
        .auth-input:focus {
          border-color: #c8956c;
        }
        .auth-input::placeholder {
          color: #3a3836;
        }
        .forgot-btn {
          background: transparent;
          border: none;
          color: #5a5552;
          font-size: 11.5px;
          cursor: pointer;
          padding: 0;
          transition: color 0.12s;
        }
        .forgot-btn:hover { color: #c8956c; }
        .auth-submit {
          width: 100%;
          margin-top: 4px;
        }
        .demo-btn {
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.08);
          color: #4a4846;
          font-size: 12px;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.12s, border-color 0.12s;
          text-align: center;
        }
        .demo-btn:hover {
          color: #8a8480;
          border-color: rgba(255,255,255,0.14);
        }
        .auth-footer {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #4a4846;
        }
        .auth-link {
          background: transparent;
          border: none;
          color: #c8956c;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};
