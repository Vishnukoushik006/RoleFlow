import React, { useState, useEffect, useCallback } from 'react';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { Loader } from '../components/common/Loader';
import { applicationService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { Plus } from 'lucide-react';

const COLUMNS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

export const KanbanPage = ({ onNavigate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState('Applied');

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationService.getAll({ limit: 200 });
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      toast.error('Failed to load kanban applications');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleMoveStatus = async (appId, newStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await applicationService.update(appId, { status: newStatus });
      toast.success(`Application moved to ${newStatus}`);

      if (newStatus === 'Offer') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      toast.error('Failed to update status');
      fetchApplications(); // Revert on failure
    }
  };

  const handleQuickAdd = (colStatus) => {
    setDefaultStatusForNew(colStatus);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loader message="Loading Kanban Pipeline..." />;
  }

  return (
    <div className="kanban-page">
      <div className="kanban-page-header">
        <div>
          <h2 className="page-title">Application Kanban Pipeline</h2>
          <p className="page-subtitle">Drag and drop cards across columns to update application stage.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setDefaultStatusForNew('Applied');
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Application</span>
        </button>
      </div>

      <div className="kanban-board-container">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => (a.status || 'Applied') === col);
          return (
            <KanbanColumn
              key={col}
              status={col}
              applications={colApps}
              onSelectApp={(id) => onNavigate(`/applications/${id}`)}
              onMoveStatus={handleMoveStatus}
              onQuickAdd={handleQuickAdd}
            />
          );
        })}
      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={defaultStatusForNew !== 'Applied' ? { status: defaultStatusForNew } : null}
        onSaved={fetchApplications}
      />

      <style>{`
        .kanban-page {
          display: flex;
          flex-direction: column;
        }
        .kanban-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .kanban-board-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
        }
      `}</style>
    </div>
  );
};
