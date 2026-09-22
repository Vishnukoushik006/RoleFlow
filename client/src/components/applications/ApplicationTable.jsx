import React from 'react';
import { StatusBadge, SourceBadge } from '../common/Badge';
import { ExternalLink, MoreVertical, Edit2, Trash2, Calendar, FileText } from 'lucide-react';

export const ApplicationTable = ({
  applications = [],
  onSelectApp,
  onEditApp,
  onDeleteApp
}) => {
  return (
    <div className="table-wrapper">
      <table className="app-table">
        <thead>
          <tr>
            <th>Company & Role</th>
            <th>Status</th>
            <th>Location / Type</th>
            <th>Applied Date</th>
            <th>Source</th>
            <th>Resume</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const dateStr = new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <tr
                key={app._id}
                className="table-row"
                onClick={() => onSelectApp(app._id)}
              >
                <td>
                  <div className="company-cell">
                    {app.companyLogo ? (
                      <img src={app.companyLogo} alt={app.companyName} className="company-logo-img" />
                    ) : (
                      <div className="company-logo-placeholder">
                        {app.companyName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                    <div className="company-meta">
                      <span className="job-title-text">{app.jobTitle}</span>
                      <span className="company-name-text">
                        {app.companyName}
                        {app.salary && <span className="salary-pill">{app.salary}</span>}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={app.status} />
                </td>
                <td>
                  <div className="location-cell">
                    <span>{app.location || 'Remote'}</span>
                    <span className="job-type-sub">{app.jobType || 'Full-time'}</span>
                  </div>
                </td>
                <td>
                  <span className="date-cell">{dateStr}</span>
                </td>
                <td>
                  <SourceBadge source={app.source} />
                </td>
                <td>
                  {app.resumeUsed ? (
                    <span className="resume-badge" title={app.resumeUsed.name}>
                      <FileText size={12} />
                      <span className="resume-name-truncate">{app.resumeUsed.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="text-right">
                  <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-icon-action"
                        title="Open Original Job Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      className="btn-icon-action"
                      onClick={() => onEditApp(app)}
                      title="Edit Application"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon-action btn-icon-danger"
                      onClick={() => onDeleteApp(app._id)}
                      title="Delete Application"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }
        .app-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }
        .app-table th {
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .table-row:hover {
          background-color: rgba(255, 255, 255, 0.04);
        }
        .table-row td {
          padding: 14px 18px;
          vertical-align: middle;
        }
        .company-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .company-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          object-fit: cover;
          background: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .company-logo-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c8956c;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13.5px;
        }
        .company-meta {
          display: flex;
          flex-direction: column;
        }
        .job-title-text {
          font-weight: 600;
          color: #edebe6;
        }
        .company-name-text {
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .salary-pill {
          padding: 1px 5px;
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .location-cell {
          display: flex;
          flex-direction: column;
          color: #cbd5e1;
        }
        .job-type-sub {
          font-size: 11px;
          color: #64748b;
        }
        .date-cell {
          color: #94a3b8;
          font-family: var(--font-mono);
          font-size: 12px;
        }
        .resume-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 6px;
          color: #a5b4fc;
          font-size: 11.5px;
          max-width: 140px;
        }
        .resume-name-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .text-right {
          text-align: right;
        }
        .row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }
        .btn-icon-action {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .btn-icon-action:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.08);
        }
        .btn-icon-danger:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }
      `}</style>
    </div>
  );
};
