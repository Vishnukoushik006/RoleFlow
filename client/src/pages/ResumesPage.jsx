import React, { useState, useEffect, useCallback } from 'react';
import { ResumeUploadModal } from '../components/resumes/ResumeUploadModal';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { resumeService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  Star,
  Briefcase,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const ResumesPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reparsingId, setReparsingId] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeService.getAll();
      if (res.success) {
        setResumes(res.data);
      }
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleSetDefault = async (id) => {
    try {
      await resumeService.setDefault(id);
      toast.success('Default resume updated');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  const handleReparse = async (id) => {
    setReparsingId(id);
    try {
      const res = await resumeService.reparse(id);
      if (res.success) {
        toast.success(`Extracted ${res.data?.parsedSkills?.length || 0} skills successfully!`);
        fetchResumes();
      }
    } catch (err) {
      toast.error('Failed to re-parse resume');
    } finally {
      setReparsingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resume version? (Existing applications will keep their history)')) {
      try {
        await resumeService.delete(id);
        toast.success('Resume deleted');
        fetchResumes();
      } catch (err) {
        toast.error('Error deleting resume');
      }
    }
  };

  if (loading) {
    return <Loader message="Loading resume repository..." />;
  }

  return (
    <div className="resumes-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Resume Vault ({resumes.length})</h2>
          <p className="page-subtitle">Manage tailored resume versions, track usage across jobs, and inspect extracted skills.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} />
          <span>Upload Resume</span>
        </button>
      </div>

      {resumes.length > 0 ? (
        <div className="resume-grid">
          {resumes.map((resume) => {
            const dateStr = new Date(resume.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const isReparsing = reparsingId === resume._id;

            return (
              <div key={resume._id} className="card resume-card">
                <div className="resume-card-header">
                  <div className="resume-icon-badge">
                    <FileText size={20} color="#c8956c" />
                  </div>
                  <div className="resume-meta-title">
                    <h4 className="resume-name">{resume.name}</h4>
                    <span className="resume-date">Added on {dateStr}</span>
                  </div>
                  {resume.isDefault ? (
                    <span className="default-pill" title="Default Resume for New Submissions">
                      <Star size={11} /> Default
                    </span>
                  ) : (
                    <button
                      className="btn-set-default"
                      onClick={() => handleSetDefault(resume._id)}
                      title="Set as Default"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="resume-stats-row">
                  <div className="stat-item">
                    <Briefcase size={13} />
                    <span>Used in <strong>{resume.usageCount || 0}</strong> application(s)</span>
                  </div>
                  <div className="stat-item">
                    <span>File size: {((resume.fileSize || 0) / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="resume-skills-section">
                  <div className="skills-section-header">
                    <span className="skills-section-label">
                      Identified Skills ({resume.parsedSkills?.length || 0}):
                    </span>
                    <button
                      className="btn-text-reparse"
                      onClick={() => handleReparse(resume._id)}
                      disabled={isReparsing}
                      title="Re-extract skills from file"
                    >
                      <RefreshCw size={11} className={isReparsing ? 'spin-icon' : ''} />
                      <span>{isReparsing ? 'Scanning...' : 'Re-scan'}</span>
                    </button>
                  </div>
                  {resume.parsedSkills && resume.parsedSkills.length > 0 ? (
                    <div className="skills-pills-wrap">
                      {resume.parsedSkills.map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-skills-note">No technical skills detected yet. Click "Re-scan" to extract.</p>
                  )}
                </div>

                <div className="resume-card-actions">
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <ExternalLink size={13} />
                    <span>View File</span>
                  </a>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleReparse(resume._id)}
                    disabled={isReparsing}
                    title="Re-scan skills"
                  >
                    <RefreshCw size={13} className={isReparsing ? 'spin-icon' : ''} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(resume._id)}
                    title="Delete Resume"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded yet"
          description="Upload tailored resume versions (PDF or DOCX) to attach them to your job applications."
          actionLabel="+ Upload Resume"
          onAction={() => setIsUploadModalOpen(true)}
        />
      )}

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={fetchResumes}
      />

      <style>{`
        .resumes-page {
          display: flex;
          flex-direction: column;
        }
        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .resume-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .resume-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .resume-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .resume-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(200, 149, 108, 0.1);
          border: 1px solid rgba(200, 149, 108, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .resume-meta-title {
          flex: 1;
          overflow: hidden;
        }
        .resume-name {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .resume-date {
          font-size: 11.5px;
          color: var(--text-secondary);
        }
        .default-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(245, 158, 11, 0.15);
          color: #fde68a;
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }
        .btn-set-default {
          background: transparent;
          border: 1px solid var(--border-hover);
          color: var(--text-secondary);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .btn-set-default:hover {
          color: var(--text-main);
          background: var(--border);
        }
        .resume-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .resume-skills-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .skills-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .skills-section-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .btn-text-reparse {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #c8956c;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 4px;
        }
        .btn-text-reparse:hover:not(:disabled) {
          text-decoration: underline;
        }
        .btn-text-reparse:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .skills-pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .skill-pill {
          padding: 3px 8px;
          background: rgba(200, 149, 108, 0.12);
          color: #e6c5a8;
          border: 1px solid rgba(200, 149, 108, 0.25);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .no-skills-note {
          font-size: 11.5px;
          color: #78716c;
          font-style: italic;
          margin: 0;
        }
        .resume-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};
