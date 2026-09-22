import React from 'react';
import { SourceBadge } from '../common/Badge';
import { MapPin, DollarSign, Calendar, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const COLUMNS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

export const KanbanCard = ({ application, onSelect, onMoveStatus, onOpenAI }) => {
  const currentIndex = COLUMNS.indexOf(application.status);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('applicationId', application._id);
    e.dataTransfer.setData('currentStatus', application.status);
  };

  const handleMoveLeft = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onMoveStatus(application._id, COLUMNS[currentIndex - 1]);
    }
  };

  const handleMoveRight = (e) => {
    e.stopPropagation();
    if (currentIndex < COLUMNS.length - 1) {
      onMoveStatus(application._id, COLUMNS[currentIndex + 1]);
    }
  };

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(application._id)}
    >
      <div className="kanban-card-top">
        <div className="kanban-company-row">
          {application.companyLogo ? (
            <img src={application.companyLogo} alt={application.companyName} className="kanban-logo" />
          ) : (
            <div className="kanban-logo-placeholder">
              {application.companyName?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}
          <div className="kanban-company-meta">
            <span className="kanban-company-name">{application.companyName}</span>
            <span className="kanban-job-title">{application.jobTitle}</span>
          </div>
        </div>
      </div>

      <div className="kanban-meta-tags">
        <span className="kanban-tag">
          <MapPin size={11} />
          {application.location || 'Remote'}
        </span>
        {application.salary && (
          <span className="kanban-tag salary-tag">
            <DollarSign size={11} />
            {application.salary}
          </span>
        )}
      </div>

      <div className="kanban-card-footer">
        <SourceBadge source={application.source} />
        
        <div className="kanban-move-controls" onClick={(e) => e.stopPropagation()}>
          {currentIndex > 0 && (
            <button
              className="btn-move-arrow"
              onClick={handleMoveLeft}
              title={`Move to ${COLUMNS[currentIndex - 1]}`}
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {currentIndex < COLUMNS.length - 1 && (
            <button
              className="btn-move-arrow"
              onClick={handleMoveRight}
              title={`Move to ${COLUMNS[currentIndex + 1]}`}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .kanban-card {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px;
          cursor: grab;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
          user-select: none;
        }
        .kanban-card:hover {
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }
        .kanban-card:active {
          cursor: grabbing;
        }
        .kanban-company-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kanban-logo {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
          background: #fff;
        }
        .kanban-logo-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          color: #c8956c;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kanban-company-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .kanban-company-name {
          font-size: 12px;
          color: #8a8480;
          font-weight: 500;
        }
        .kanban-job-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #edebe6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kanban-meta-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .kanban-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: #8a8480;
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .salary-tag {
          color: #4aab7c;
          background: rgba(74, 171, 124, 0.1);
        }
        .kanban-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .kanban-move-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-move-arrow {
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #8a8480;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }
        .btn-move-arrow:hover {
          color: #0f0f0f;
          background: #c8956c;
          border-color: #c8956c;
        }
      `}</style>
    </div>
  );
};
