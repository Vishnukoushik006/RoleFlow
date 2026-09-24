import React from 'react';

export const Loader = ({ size = 24, message }) => {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" style={{ width: size, height: size }} />
      {message && <span className="loader-msg">{message}</span>}
      <style>{`
        .loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          gap: 14px;
        }
        .loader-ring {
          border: 2px solid var(--border);
          border-top-color: #c8956c;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        .loader-msg {
          font-size: 12.5px;
          color: var(--text-muted);
          letter-spacing: 0.01em;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
