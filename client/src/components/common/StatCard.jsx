import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = '#c8956c' }) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{title}</span>
        {Icon && <Icon size={15} className="stat-icon" />}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-sub">{subtext}</div>}

      <style>{`
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.15s ease;
        }
        .stat-card:hover {
          border-color: var(--border-hover);
        }
        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .stat-icon {
          color: var(--text-muted);
        }
        .stat-value {
          font-size: 30px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-top: 4px;
        }
        .stat-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
