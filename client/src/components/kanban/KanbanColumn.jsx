import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

const STATUS_COLORS = {
  Saved: '#64748b',
  Applied: '#3b82f6',
  Assessment: '#8b5cf6',
  Interview: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444'
};

export const KanbanColumn = ({
  status,
  applications = [],
  onSelectApp,
  onMoveStatus,
  onQuickAdd
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const color = STATUS_COLORS[status] || '#c8956c';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const applicationId = e.dataTransfer.getData('applicationId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (applicationId && currentStatus !== status) {
      onMoveStatus(applicationId, status);
    }
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <span className="column-indicator" style={{ backgroundColor: color }} />
          <h3 className="column-title">{status}</h3>
          <span className="column-count">{applications.length}</span>
        </div>
        {onQuickAdd && (
          <button
            className="btn-col-add"
            onClick={() => onQuickAdd(status)}
            title={`Add ${status} Application`}
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="column-cards-container">
        {applications.map((app) => (
          <KanbanCard
            key={app._id}
            application={app}
            onSelect={onSelectApp}
            onMoveStatus={onMoveStatus}
          />
        ))}

        {applications.length === 0 && (
          <div className="column-empty-placeholder">
            <span>Drop here or click + to add</span>
          </div>
        )}
      </div>

      <style>{`
        .kanban-column {
          flex: 1;
          min-width: 280px;
          max-width: 340px;
          background: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 170px);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .kanban-column.drag-over {
          border-color: rgba(200, 149, 108, 0.4);
          background: rgba(200, 149, 108, 0.04);
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .column-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .column-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .column-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }
        .column-count {
          padding: 1px 7px;
          background: var(--border);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .btn-col-add {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .btn-col-add:hover {
          color: var(--text-main);
          background: var(--border);
        }
        .column-cards-container {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          flex: 1;
        }
        .column-empty-placeholder {
          height: 90px;
          border: 1px dashed var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};
