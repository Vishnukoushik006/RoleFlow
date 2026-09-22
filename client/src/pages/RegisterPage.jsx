import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Lock, Mail, User, Target } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, targetRole });
      toast.success('Account created! Welcome to JobTrack.');
      onNavigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">

        <div className="auth-brand">
          <span className="auth-dot">●</span>
          <span className="auth-wordmark">JobTrack</span>
        </div>

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-sub">Get organized from day one. Free, forever.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full name</label>
            <div className="auth-input-wrap">
              <User size={14} className="auth-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrap">
              <Mail size={14} className="auth-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Target role</label>
            <div className="auth-input-wrap">
              <Target size={14} className="auth-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="Software Engineer, Data Scientist…"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password (6+ characters)</label>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-icon" />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Get started'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button className="auth-link" onClick={() => onNavigate('/login')}>
            Sign in
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
          padding: 20px 0;
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
          margin-bottom: 28px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
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
        .auth-input-wrap { position: relative; }
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
        .auth-input:focus { border-color: #c8956c; }
        .auth-input::placeholder { color: #3a3836; }
        .auth-submit { width: 100%; margin-top: 6px; }
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
