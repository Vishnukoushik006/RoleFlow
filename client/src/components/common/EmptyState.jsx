import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating a new entry or adjusting your filters.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          background: var(--bg-surface);
          border: 1px dashed var(--border-hover);
          border-radius: 12px;
          margin: 16px 0;
        }
        .empty-state-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(200, 149, 108, 0.1);
          color: #c8956c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .empty-state-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 6px;
        }
        .empty-state-desc {
          font-size: 13px;
          color: var(--text-secondary);
          max-width: 380px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export const Loader = ({ size = 32, message }) => {
  return (
    <div className="loader-container">
      <div className="spinner" style={{ width: size, height: size }} />
      {message && <span className="loader-message">{message}</span>}
      <style>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          gap: 12px;
        }
        .spinner {
          border: 3px solid var(--border);
          border-top-color: #c8956c;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loader-message {
          font-size: 13px;
          color: var(--text-secondary);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
