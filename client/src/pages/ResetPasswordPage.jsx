import React, { useState } from 'react';
import { authService } from '../services/domainServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowRight, Lock, Key } from 'lucide-react';

export const ResetPasswordPage = ({ onNavigate, token: propToken }) => {
  const { setAuthSession } = useAuth();
  const toast = useToast();
  
  // Extract token from prop or url pathname
  const [token, setToken] = useState(() => {
    if (propToken) return propToken;
    const path = window.location.pathname;
    const match = path.match(/\/reset-password\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      if (res.success && res.token && res.user) {
        setAuthSession(res.token, res.user);
        toast.success('Password updated successfully! Welcome to RoleFlow.');
        onNavigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired password reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-dot">●</span>
          <span className="auth-wordmark">RoleFlow</span>
        </div>

        <h1 className="auth-heading">Set new password</h1>
        <p className="auth-sub">Choose a new password with at least 6 characters.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!propToken && (
            <div className="auth-field">
              <label className="auth-label">Reset token</label>
              <div className="auth-input-wrap">
                <Key size={14} className="auth-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">New password (min. 6 characters)</label>
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

          <div className="auth-field">
            <label className="auth-label">Confirm new password</label>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-icon" />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>{loading ? 'Updating password...' : 'Update password'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="auth-footer">
          <button className="auth-link" onClick={() => onNavigate('/login')}>
            Cancel & return to sign in
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
        }
        .auth-sub {
          font-size: 13.5px;
          color: #8a8480;
          line-height: 1.5;
          margin-bottom: 28px;
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
          font-size: 12.5px;
          font-weight: 500;
          color: #8a8480;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-icon {
          position: absolute;
          left: 13px;
          color: #5a5552;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          height: 40px;
          padding: 0 13px 0 38px;
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #edebe6;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .auth-input:focus {
          border-color: #c8956c;
        }
        .auth-submit-btn {
          height: 40px;
          margin-top: 6px;
          background: #c8956c;
          color: #0f0f0f;
          font-weight: 600;
          font-size: 13.5px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease;
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: #b37d57;
        }
        .auth-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: center;
        }
        .auth-link {
          background: none;
          border: none;
          color: #8a8480;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.15s ease;
        }
        .auth-link:hover {
          color: #edebe6;
        }
      `}</style>
    </div>
  );
};
