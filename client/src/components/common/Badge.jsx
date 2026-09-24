import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'Applied').toLowerCase();
  let badgeClass = 'badge-applied';

  switch (normalized) {
    case 'saved':
      badgeClass = 'badge-saved';
      break;
    case 'applied':
      badgeClass = 'badge-applied';
      break;
    case 'assessment':
      badgeClass = 'badge-assessment';
      break;
    case 'interview':
      badgeClass = 'badge-interview';
      break;
    case 'offer':
      badgeClass = 'badge-offer';
      break;
    case 'rejected':
      badgeClass = 'badge-rejected';
      break;
    case 'withdrawn':
      badgeClass = 'badge-withdrawn';
      break;
    default:
      badgeClass = 'badge-applied';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status || 'Applied'}
      <style>{`
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
      `}</style>
    </span>
  );
};

export const SourceBadge = ({ source }) => {
  return (
    <span className="source-tag-pill">
      {source || 'Other'}
      <style>{`
        .source-tag-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }
      `}</style>
    </span>
  );
};
