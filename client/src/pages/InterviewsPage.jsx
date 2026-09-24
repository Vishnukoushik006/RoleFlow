import React, { useState, useEffect, useCallback } from 'react';
import { InterviewModal } from '../components/interviews/InterviewModal';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { interviewService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  Video,
  User,
  ExternalLink,
  Plus,
  CheckCircle2,
  Trash2,
  Building,
  Edit2
} from 'lucide-react';

export const InterviewsPage = ({ onNavigate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'past'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await interviewService.getAll({ filter });
      if (res.success) {
        setInterviews(res.data);
      }
    } catch (err) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleToggleStatus = async (interview) => {
    const nextStatus = interview.status === 'Completed' ? 'Scheduled' : 'Completed';
    try {
      await interviewService.update(interview._id, { status: nextStatus });
      toast.success(`Interview marked as ${nextStatus}`);
      fetchInterviews();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this interview schedule?')) {
      try {
        await interviewService.delete(id);
        toast.success('Interview deleted');
        fetchInterviews();
      } catch (err) {
        toast.error('Failed to delete interview');
      }
    }
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loader message="Loading interview schedule..." />;
  }

  return (
    <div className="interviews-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Interview Calendar & Prep ({interviews.length})</h2>
          <p className="page-subtitle">Track upcoming screening rounds, meeting links, preparation notes, and interviewer details.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedInterview(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Schedule Interview</span>
        </button>
      </div>

      <div className="filter-tabs-row">
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Rounds
        </button>
        <button
          className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming Only
        </button>
        <button
          className={`tab-btn ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past / Completed
        </button>
      </div>

      {interviews.length > 0 ? (
        <div className="interviews-grid">
          {interviews.map((iv) => {
            const dateStr = new Date(iv.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const isCompleted = iv.status === 'Completed';

            return (
              <div key={iv._id} className={`card interview-card ${isCompleted ? 'completed-card' : ''}`}>
                <div className="interview-card-header">
                  <div className="iv-company-info">
                    <span className="iv-company-name">{iv.companyName}</span>
                    <h4 className="iv-round-title">{iv.round}</h4>
                  </div>
                  <button
                    className={`status-toggle-btn ${isCompleted ? 'is-completed' : ''}`}
                    onClick={() => handleToggleStatus(iv)}
                    title={isCompleted ? 'Mark Scheduled' : 'Mark Completed'}
                  >
                    <CheckCircle2 size={16} />
                    <span>{iv.status}</span>
                  </button>
                </div>

                <div className="iv-details-list">
                  <div className="iv-detail-row">
                    <Calendar size={14} color="#f59e0b" />
                    <span>{dateStr} at {iv.time}</span>
                  </div>
                  <div className="iv-detail-row">
                    <Video size={14} color="#06b6d4" />
                    <span>{iv.type}</span>
                  </div>
                  {iv.interviewer && (
                    <div className="iv-detail-row">
                      <User size={14} color="var(--text-secondary)" />
                      <span>{iv.interviewer}</span>
                    </div>
                  )}
                </div>

                {iv.topics && iv.topics.length > 0 && (
                  <div className="iv-topics-wrap">
                    <span className="topics-label">Focus Areas:</span>
                    <div className="topics-pills">
                      {iv.topics.map((t, idx) => (
                        <span key={idx} className="topic-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {iv.notes && (
                  <div className="iv-notes-box">
                    <p>{iv.notes}</p>
                  </div>
                )}

                <div className="iv-card-footer">
                  {iv.meetingUrl ? (
                    <a
                      href={iv.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <Video size={13} />
                      <span>Join Meeting</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-muted text-xs">No link attached</span>
                  )}

                  <div className="iv-actions">
                    <button
                      className="btn-icon-action"
                      onClick={() => handleEdit(iv)}
                      title="Edit Interview"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon-action btn-icon-danger"
                      onClick={() => handleDelete(iv._id)}
                      title="Delete Interview"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No interview rounds scheduled"
          description="Log your upcoming screenings, technical rounds, and behavioral chats to keep your prep organized."
          actionLabel="+ Schedule Interview"
          onAction={() => {
            setSelectedInterview(null);
            setIsModalOpen(true);
          }}
        />
      )}

      <InterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interview={selectedInterview}
        onSaved={fetchInterviews}
      />

      <style>{`
        .interviews-page {
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
        .interviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .interview-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .completed-card {
          opacity: 0.8;
          border-color: rgba(74, 171, 124, 0.2);
        }
        .interview-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .iv-company-name {
          font-size: 11.5px;
          color: #c8956c;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .iv-round-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          margin-top: 2px;
        }
        .status-toggle-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 6px;
          color: #fde68a;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .status-toggle-btn.is-completed {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }
        .iv-details-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-surface);
          padding: 10px 12px;
          border-radius: 8px;
        }
        .iv-detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .iv-topics-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .topics-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .topics-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .topic-pill {
          padding: 2px 7px;
          background: rgba(6, 182, 212, 0.12);
          color: #67e8f9;
          border-radius: 4px;
          font-size: 11px;
        }
        .iv-notes-box {
          padding: 10px;
          background: var(--bg-surface);
          border-radius: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .iv-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .iv-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
