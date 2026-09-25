import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import { ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage = ({ onNavigate }) => {
  const { setAuthSession } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (res.success) {
        if (res.token && res.user && setAuthSession) {
          setAuthSession(res.token, res.user);
        }
        toast.success('Password updated successfully! Welcome to RoleFlow.');
        onNavigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to update password. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">

        {/* Brand Header */}
        <div className="auth-brand-center">
          <div className="auth-title-row">
            <span className="auth-dot-large">●</span>
            <span className="auth-name-large">RoleFlow</span>
          </div>
          <p className="auth-welcome-line">Welcome to my corner of Internet !</p>
        </div>

        <h1 className="auth-heading">Reset password</h1>
        <p className="auth-sub">Enter your email and choose a new password.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Account email</label>
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
            <label className="auth-label">New password (min. 6 characters)</label>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input auth-input-pw"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="pw-eye"
                onClick={() => setShowPw((v) => !v)}
                tabIndex="-1"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm new password</label>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="auth-input auth-input-pw"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="pw-eye"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Updating password…' : 'Update password'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="auth-footer">
          <button className="auth-link" onClick={() => onNavigate('/login')}>
            <ArrowLeft size={13} />
            <span>Back to sign in</span>
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
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }
        .auth-brand-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-title-row {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .auth-dot-large {
          font-size: 16px;
          color: #c8956c;
          line-height: 1;
        }
        .auth-name-large {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 40px;
          font-weight: 700;
          color: #E2E8F0;
          letter-spacing: -0.03em;
        }
        .auth-welcome-line {
          font-family: 'Lora', serif;
          font-size: 26px;
          color: #B2BEB5;
          margin-top: 8px;
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        .auth-heading {
          font-size: 22px;
          font-weight: 600;
          color: #edebe6;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          line-height: 1.2;
          text-align: center;
        }
        .auth-sub {
          font-size: 13px;
          color: #A1A1AA;
          line-height: 1.5;
          margin-bottom: 24px;
          text-align: center;
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
        .auth-input-pw {
          padding-right: 36px;
        }
        .pw-eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #4a4846;
          cursor: pointer;
          display: flex;
          padding: 0;
          transition: color 0.12s;
        }
        .pw-eye:hover {
          color: #8a8480;
        }
        .auth-submit {
          width: 100%;
          margin-top: 4px;
        }
        .auth-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-link {
          background: transparent;
          border: none;
          color: #8a8480;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          transition: color 0.14s ease;
        }
        .auth-link:hover {
          color: #edebe6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
