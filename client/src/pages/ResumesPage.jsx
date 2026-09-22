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
  ExternalLink
} from 'lucide-react';

export const ResumesPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
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

                {resume.parsedSkills && resume.parsedSkills.length > 0 && (
                  <div className="resume-skills-section">
                    <span className="skills-section-label">Identified Skills ({resume.parsedSkills.length}):</span>
                    <div className="skills-pills-wrap">
                      {resume.parsedSkills.slice(0, 10).map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                      {resume.parsedSkills.length > 10 && (
                        <span className="skill-pill-more">+{resume.parsedSkills.length - 10} more</span>
                      )}
                    </div>
                  </div>
                )}

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
          color: #edebe6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .resume-date {
          font-size: 11.5px;
          color: #8a8480;
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .btn-set-default:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }
        .resume-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          font-size: 12px;
          color: #cbd5e1;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .resume-skills-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .skills-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .skills-pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .skill-pill {
          padding: 2px 7px;
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border-radius: 4px;
          font-size: 11px;
        }
        .skill-pill-more {
          padding: 2px 6px;
          color: #64748b;
          font-size: 11px;
        }
        .resume-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </div>
  );
};
