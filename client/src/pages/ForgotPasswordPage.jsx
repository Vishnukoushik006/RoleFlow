import React, { useState } from 'react';
import { authService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import { KeyRound, ArrowRight, ArrowLeft, Mail, CheckCircle2, Copy } from 'lucide-react';

export const ForgotPasswordPage = ({ onNavigate }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      if (res.success) {
        setResetData(res);
        toast.success(res.message || 'Password reset link generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (resetData?.resetToken) {
      navigator.clipboard.writeText(resetData.resetToken);
      toast.success('Reset token copied to clipboard!');
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-dot">●</span>
          <span className="auth-wordmark">JobTrack</span>
        </div>

        <h1 className="auth-heading">Forgot password?</h1>
        <p className="auth-sub">Enter your email and we'll send a secure password reset link.</p>

        {!resetData ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email address</label>
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Sending link...' : 'Send reset link'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          <div className="reset-success-box">
            <div className="success-heading-row">
              <CheckCircle2 size={16} className="text-emerald" />
              <span className="success-heading">Reset link ready</span>
            </div>
            <p className="auth-sub" style={{ marginTop: '6px' }}>
              Your password reset token has been generated.
            </p>

            {resetData.resetToken && (
              <div className="token-display-card">
                <span className="token-label">Token:</span>
                <div className="token-code-row">
                  <code>{resetData.resetToken}</code>
                  <button type="button" className="token-copy-btn" onClick={copyToken} title="Copy Token">
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="auth-submit-btn mt-4"
              onClick={() => onNavigate(`/reset-password/${resetData.resetToken}`)}
            >
              <span>Continue to reset</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

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
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          transition: color 0.15s ease;
        }
        .auth-link:hover {
          color: #edebe6;
        }
        .reset-success-box {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 18px;
        }
        .success-heading-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .text-emerald { color: #4aab7c; }
        .success-heading {
          font-size: 14px;
          font-weight: 600;
          color: #edebe6;
        }
        .token-display-card {
          margin-top: 14px;
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .token-label {
          font-size: 11px;
          font-weight: 500;
          color: #8a8480;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .token-code-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .token-code-row code {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: #edebe6;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .token-copy-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #8a8480;
          border-radius: 4px;
          padding: 4px 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .token-copy-btn:hover {
          color: #edebe6;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .mt-4 { margin-top: 16px; }
      `}</style>
    </div>
  );
};
