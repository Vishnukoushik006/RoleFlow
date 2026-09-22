import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, SourceBadge } from '../components/common/Badge';
import { Timeline } from '../components/timeline/Timeline';
import { AddEventModal } from '../components/timeline/AddEventModal';
import { InterviewModal } from '../components/interviews/InterviewModal';
import { ReminderModal } from '../components/reminders/ReminderModal';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';
import { Loader } from '../components/common/Loader';
import { applicationService, interviewService, reminderService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Target,
  Plus,
  MapPin,
  DollarSign,
  Building,
  CheckCircle2
} from 'lucide-react';

const STATUS_OPTIONS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

export const ApplicationDetailPage = ({ id, onNavigate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await applicationService.getById(id);
      if (res.success) {
        setApplication(res.data);
      }
    } catch (err) {
      toast.error('Failed to load application details');
      onNavigate('/applications');
    } finally {
      setLoading(false);
    }
  }, [id, onNavigate, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusChange = async (newStatus) => {
    if (!application || application.status === newStatus) return;
    try {
      const res = await applicationService.update(application._id, { status: newStatus });
      setApplication(res.data);
      toast.success(`Status updated to ${newStatus}`);
      
      // Celebrate offer!
      if (newStatus === 'Offer') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      fetchDetail();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this application and all related events, interviews, and reminders?')) {
      try {
        await applicationService.delete(application._id);
        toast.success('Application removed');
        onNavigate('/applications');
      } catch (err) {
        toast.error('Failed to delete application');
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await applicationService.deleteEvent(application._id, eventId);
      toast.success('Event removed from timeline');
      fetchDetail();
    } catch (err) {
      toast.error('Failed to remove event');
    }
  };

  if (loading || !application) {
    return <Loader message="Loading application details & timeline..." />;
  }

  const appliedFormatted = new Date(application.appliedDate || application.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="detail-container">
      {/* Back link */}
      <button className="back-link" onClick={() => onNavigate('/applications')}>
        <ArrowLeft size={16} />
        <span>Back to Applications</span>
      </button>

      {/* Main Header Card */}
      <div className="card detail-header-card">
        <div className="detail-header-left">
          {application.companyLogo ? (
            <img src={application.companyLogo} alt={application.companyName} className="detail-logo" />
          ) : (
            <div className="detail-logo-placeholder">
              {application.companyName?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}

          <div className="detail-title-block">
            <div className="title-row">
              <h1 className="detail-job-title">{application.jobTitle}</h1>
              <StatusBadge status={application.status} />
            </div>

            <div className="company-subtitle-row">
              <span className="detail-company-name">{application.companyName}</span>
              {application.location && (
                <span className="meta-pill">
                  <MapPin size={12} /> {application.location}
                </span>
              )}
              {application.salary && (
                <span className="meta-pill salary-pill">
                  <DollarSign size={12} /> {application.salary}
                </span>
              )}
              <SourceBadge source={application.source} />
            </div>
          </div>
        </div>

        <div className="detail-header-right">
          {/* Status Quick Select */}
          <div className="status-selector-wrap">
            <span className="status-sel-label">Update Status:</span>
            <select
              className="select-field select-status-quick"
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="action-buttons-row">
            <button className="btn btn-primary btn-sm" onClick={() => setIsAIModalOpen(true)}>
              <Target size={14} />
              <span>Match & Extract</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Timeline on Left, Details & Actions on Right */}
      <div className="detail-content-grid">
        {/* Left: Application Timeline & Events */}
        <div className="detail-main-col">
          <div className="card mb-4">
            <div className="flex-between mb-3">
              <h3 className="section-title mb-0">
                <Clock size={16} color="#c8956c" />
                <span>Timeline</span>
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEventModalOpen(true)}
              >
                <Plus size={14} />
                <span>Add Event</span>
              </button>
            </div>
            <Timeline
              events={application.events || []}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>

          {/* Job Description Card */}
          {application.jobDescription && (
            <div className="card">
              <div className="flex-between mb-3">
                <h3 className="section-title mb-0">
                  <FileText size={16} color="#c8956c" />
                  <span>Job Description</span>
                </h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAIModalOpen(true)}
                >
                  <Target size={13} color="#c8956c" />
                  <span>Match & Extract</span>
                </button>
              </div>
              <div className="job-description-content">
                {application.jobDescription}
              </div>
            </div>
          )}
        </div>

        {/* Right: Overview Metadata, Linked Resume, Interviews, Reminders */}
        <div className="detail-side-col">
          {/* Overview Info Card */}
          <div className="card mb-4">
            <h3 className="section-title">Application Details</h3>
            <div className="meta-list">
              <div className="meta-item">
                <span className="meta-label">Applied Date</span>
                <span className="meta-val">{appliedFormatted}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Job Type</span>
                <span className="meta-val">{application.jobType || 'Full-time'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Source Platform</span>
                <span className="meta-val">{application.source || 'LinkedIn'}</span>
              </div>
              {application.jobUrl && (
                <div className="meta-item">
                  <span className="meta-label">Job Link</span>
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-link"
                  >
                    <span>View Posting</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Resume Used</span>
                {application.resumeUsed ? (
                  <span className="meta-val resume-linked-val">
                    <FileText size={13} color="#c8956c" />
                    {application.resumeUsed.name}
                  </span>
                ) : (
                  <span className="text-muted text-xs">No resume attached</span>
                )}
              </div>
            </div>

            {application.notes && (
              <div className="detail-notes-box">
                <span className="notes-label">Notes:</span>
                <p>{application.notes}</p>
              </div>
            )}
          </div>

          {/* Interviews for this Application */}
          <div className="card mb-4">
            <div className="flex-between mb-3">
              <h3 className="section-title mb-0">
                <Calendar size={16} color="#f59e0b" />
                <span>Interviews ({application.interviews?.length || 0})</span>
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsInterviewModalOpen(true)}
              >
                <Plus size={13} />
                <span>Schedule</span>
              </button>
            </div>
            {application.interviews && application.interviews.length > 0 ? (
              <div className="interviews-mini-list">
                {application.interviews.map((iv) => (
                  <div key={iv._id} className="interview-mini-item">
                    <div className="interview-mini-header">
                      <span className="interview-mini-round">{iv.round}</span>
                      <span className="interview-mini-date">
                        {new Date(iv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {iv.time}
                      </span>
                    </div>
                    {iv.meetingUrl && (
                      <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="interview-meet-link">
                        Join Meeting &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted text-xs">No interview rounds scheduled yet.</span>
            )}
          </div>

          {/* Reminders for this Application */}
          <div className="card">
            <div className="flex-between mb-3">
              <h3 className="section-title mb-0">
                <Clock size={16} color="#06b6d4" />
                <span>Follow-ups ({application.reminders?.length || 0})</span>
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsReminderModalOpen(true)}
              >
                <Plus size={13} />
                <span>Reminder</span>
              </button>
            </div>
            {application.reminders && application.reminders.length > 0 ? (
              <div className="reminders-mini-list">
                {application.reminders.map((rem) => (
                  <div key={rem._id} className="reminder-mini-item">
                    <span className="reminder-mini-title">{rem.title}</span>
                    <span className="reminder-mini-date">
                      Due {new Date(rem.reminderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted text-xs">No active reminders set.</span>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        application={application}
        onSaved={fetchDetail}
      />

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        applicationId={application._id}
        onEventAdded={fetchDetail}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        defaultAppId={application._id}
        onSaved={fetchDetail}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        defaultAppId={application._id}
        onSaved={fetchDetail}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        application={application}
      />

      <style>{`
        .detail-container {
          display: flex;
          flex-direction: column;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
          align-self: flex-start;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: #f8fafc;
        }
        .detail-header-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          margin-bottom: 20px;
        }
        .detail-header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .detail-logo {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          object-fit: cover;
          background: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .detail-logo-placeholder {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #c8956c;
          font-size: 22px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .detail-title-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .detail-job-title {
          font-size: 22px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.02em;
        }
        .company-subtitle-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .detail-company-name {
          font-size: 15px;
          color: #cbd5e1;
          font-weight: 600;
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .detail-header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .status-selector-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-sel-label {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
        }
        .select-status-quick {
          padding: 6px 12px;
          width: auto;
          font-weight: 600;
        }
        .action-buttons-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .job-description-content {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.6;
          white-space: pre-wrap;
          max-height: 400px;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 14px;
        }
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .meta-label {
          font-size: 12.5px;
          color: #94a3b8;
        }
        .meta-val {
          font-size: 12.5px;
          font-weight: 600;
          color: #f8fafc;
        }
        .resume-linked-val {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a5b4fc;
        }
        .meta-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #c8956c;
          font-size: 12.5px;
          font-weight: 500;
        }
        .meta-link:hover { text-decoration: underline; }
        .detail-notes-box {
          margin-top: 14px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          font-size: 12.5px;
          color: #cbd5e1;
        }
        .notes-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .interviews-mini-list, .reminders-mini-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .interview-mini-item, .reminder-mini-item {
          padding: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 6px;
        }
        .interview-mini-header {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
        }
        .interview-mini-round { font-weight: 700; color: #f8fafc; }
        .interview-mini-date { color: #f59e0b; font-size: 11.5px; }
        .interview-meet-link {
          display: inline-block;
          margin-top: 4px;
          font-size: 11.5px;
          color: #c8956c;
        }
        .reminder-mini-title { font-size: 12.5px; font-weight: 600; color: #f8fafc; display: block; }
        .reminder-mini-date { font-size: 11px; color: #06b6d4; }

        @media (max-width: 900px) {
          .detail-header-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .detail-header-right {
            align-items: flex-start;
            width: 100%;
          }
          .detail-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
