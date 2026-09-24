import React from 'react';
import {
  FilePlus,
  ArrowRightCircle,
  Code,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Mail,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';

export const Timeline = ({ events = [], onDeleteEvent }) => {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-empty">
        <Clock size={20} color="#64748b" />
        <span>No events recorded yet. Milestones will appear here as your application progresses.</span>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'Application Created':
        return <FilePlus size={16} color="#3b82f6" />;
      case 'Status Changed':
        return <ArrowRightCircle size={16} color="#8b5cf6" />;
      case 'Assessment Received':
      case 'Assessment Completed':
        return <Code size={16} color="#06b6d4" />;
      case 'Interview Scheduled':
      case 'Interview Completed':
        return <Calendar size={16} color="#f59e0b" />;
      case 'Offer Received':
        return <Award size={16} color="#10b981" />;
      case 'Rejected':
        return <XCircle size={16} color="#ef4444" />;
      case 'Recruiter Contacted':
        return <Mail size={16} color="#a855f7" />;
      default:
        return <FileText size={16} color="var(--text-secondary)" />;
    }
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-list">
        {events.map((event, idx) => {
          const dateStr = new Date(event.date || event.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div key={event._id || idx} className="timeline-item">
              <div className="timeline-icon-line">
                <div className="timeline-icon-bubble">
                  {getEventIcon(event.eventType)}
                </div>
                {idx < events.length - 1 && <div className="timeline-line" />}
              </div>

              <div className="timeline-content-card">
                <div className="timeline-card-header">
                  <div className="timeline-type-date">
                    <span className="timeline-event-type">{event.eventType}</span>
                    <span className="timeline-date">{dateStr}</span>
                  </div>
                  {onDeleteEvent && event.eventType !== 'Application Created' && (
                    <button
                      className="btn-delete-event"
                      onClick={() => onDeleteEvent(event._id)}
                      title="Delete event"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="timeline-desc">{event.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .timeline-wrapper {
          position: relative;
          padding: 8px 0;
        }
        .timeline-empty {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px;
          background: var(--bg-surface);
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .timeline-list {
          display: flex;
          flex-direction: column;
        }
        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
        }
        .timeline-icon-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
        }
        .timeline-icon-bubble {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1e293b;
          border: 2px solid var(--border-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .timeline-line {
          width: 2px;
          flex: 1;
          background: var(--border-hover);
          margin: 4px 0;
        }
        .timeline-content-card {
          flex: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
          transition: border-color 0.15s ease;
        }
        .timeline-content-card:hover {
          border-color: var(--border-hover);
        }
        .timeline-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .timeline-type-date {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .timeline-event-type {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }
        .timeline-date {
          font-size: 11.5px;
          color: #64748b;
          font-family: var(--font-mono);
        }
        .timeline-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .btn-delete-event {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }
        .btn-delete-event:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};
