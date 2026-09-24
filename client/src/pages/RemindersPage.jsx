import React, { useState, useEffect, useCallback } from 'react';
import { ReminderModal } from '../components/reminders/ReminderModal';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { reminderService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Plus,
  Calendar,
  Building
} from 'lucide-react';

export const RemindersPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' | 'completed' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await reminderService.getAll(tab === 'all' ? undefined : tab);
      if (res.success) {
        setReminders(res.data);
      }
    } catch (err) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleToggleComplete = async (reminder) => {
    const nextVal = !reminder.completed;
    try {
      await reminderService.update(reminder._id, { completed: nextVal });
      toast.success(nextVal ? 'Reminder completed!' : 'Reminder reopened');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async (id) => {
    try {
      await reminderService.delete(id);
      toast.success('Reminder removed');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  if (loading) {
    return <Loader message="Loading reminders & follow-ups..." />;
  }

  return (
    <div className="reminders-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Reminders & Follow-ups ({reminders.length})</h2>
          <p className="page-subtitle">Never miss a follow-up email, assessment deadline, or recruiter touchpoint.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedReminder(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Reminder</span>
        </button>
      </div>

      <div className="filter-tabs-row">
        <button
          className={`tab-btn ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending
        </button>
        <button
          className={`tab-btn ${tab === 'completed' ? 'active' : ''}`}
          onClick={() => setTab('completed')}
        >
          Completed
        </button>
        <button
          className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          All
        </button>
      </div>

      {reminders.length > 0 ? (
        <div className="reminders-list">
          {reminders.map((rem) => {
            const dateStr = new Date(rem.reminderDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const isPastDue = !rem.completed && new Date(rem.reminderDate) < new Date();

            return (
              <div
                key={rem._id}
                className={`card reminder-item-card ${rem.completed ? 'completed' : ''} ${isPastDue ? 'past-due' : ''}`}
              >
                <button
                  className="btn-check-toggle"
                  onClick={() => handleToggleComplete(rem)}
                  title={rem.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {rem.completed ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <Circle size={20} color={isPastDue ? '#ef4444' : '#64748b'} />
                  )}
                </button>

                <div className="reminder-text-body">
                  <div className="reminder-title-row">
                    <span className={`reminder-main-title ${rem.completed ? 'line-through' : ''}`}>
                      {rem.title}
                    </span>
                    {rem.companyName && (
                      <span className="reminder-company-pill">
                        <Building size={11} /> {rem.companyName} {rem.jobTitle ? `• ${rem.jobTitle}` : ''}
                      </span>
                    )}
                  </div>

                  {rem.description && (
                    <p className="reminder-description-text">{rem.description}</p>
                  )}

                  <div className="reminder-date-meta">
                    <Clock size={12} />
                    <span className={isPastDue ? 'text-danger font-bold' : ''}>
                      {isPastDue ? 'Overdue: ' : 'Due: '} {dateStr}
                    </span>
                  </div>
                </div>

                <button
                  className="btn-icon-action btn-icon-danger"
                  onClick={() => handleDelete(rem._id)}
                  title="Delete Reminder"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No reminders in this view"
          description="Create follow-up tasks to stay on top of your application timelines."
          actionLabel="+ Add Reminder"
          onAction={() => {
            setSelectedReminder(null);
            setIsModalOpen(true);
          }}
        />
      )}

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reminder={selectedReminder}
        onSaved={fetchReminders}
      />

      <style>{`
        .reminders-page {
          display: flex;
          flex-direction: column;
        }
        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .filter-tabs-row {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .tab-btn {
          padding: 8px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn:hover {
          color: var(--text-main);
          background: var(--border);
        }
        .tab-btn.active {
          color: var(--text-main);
          background: var(--bg-surface);
          border-color: rgba(200, 149, 108, 0.35);
        }
        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .reminder-item-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          transition: background 0.15s ease;
        }
        .reminder-item-card.completed {
          opacity: 0.6;
          background: var(--border-subtle);
        }
        .reminder-item-card.past-due {
          border-color: rgba(239, 68, 68, 0.3);
        }
        .btn-check-toggle {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .reminder-text-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .reminder-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .reminder-main-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }
        .reminder-main-title.line-through {
          text-decoration: line-through;
          color: #64748b;
        }
        .reminder-company-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          background: rgba(99, 102, 241, 0.12);
          border-radius: 4px;
          font-size: 11px;
          color: #a5b4fc;
          font-weight: 600;
        }
        .reminder-description-text {
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .reminder-date-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #64748b;
        }
        .text-danger { color: #f87171 !important; }
        .font-bold { font-weight: 700; }
      `}</style>
    </div>
  );
};
