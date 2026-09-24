import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { applicationService, resumeService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';
import { Sparkles } from 'lucide-react';

const STATUS_OPTIONS = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
];

const SOURCE_OPTIONS = [
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Company Website',
  'Greenhouse',
  'Lever',
  'Glassdoor',
  'Wellfound',
  'Referral',
  'Other'
];

const JOB_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Remote'
];

export const ApplicationModal = ({ isOpen, onClose, application = null, onSaved }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);

  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    jobTitle: '',
    location: 'Remote',
    jobUrl: '',
    source: 'LinkedIn',
    jobType: 'Full-time',
    salary: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    resumeUsed: '',
    notes: '',
    jobDescription: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load user resumes
      resumeService.getAll().then((res) => {
        if (res.success) setResumes(res.data);
      }).catch(() => {});

      if (application) {
        setFormData({
          companyName: application.companyName || '',
          companyWebsite: application.companyWebsite || '',
          jobTitle: application.jobTitle || '',
          location: application.location || 'Remote',
          jobUrl: application.jobUrl || '',
          source: application.source || 'LinkedIn',
          jobType: application.jobType || 'Full-time',
          salary: application.salary || '',
          appliedDate: application.appliedDate ? new Date(application.appliedDate).toISOString().split('T')[0] : '',
          status: application.status || 'Applied',
          resumeUsed: application.resumeUsed?._id || application.resumeUsed || '',
          notes: application.notes || '',
          jobDescription: application.jobDescription || ''
        });
      } else {
        setFormData({
          companyName: '',
          companyWebsite: '',
          jobTitle: '',
          location: 'Remote',
          jobUrl: '',
          source: 'LinkedIn',
          jobType: 'Full-time',
          salary: '',
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'Applied',
          resumeUsed: '',
          notes: '',
          jobDescription: ''
        });
      }
    }
  }, [isOpen, application]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      toast.error('Company Name and Job Title are required.');
      return;
    }

    setLoading(true);
    try {
      if (application) {
        const res = await applicationService.update(application._id, formData);
        toast.success('Application updated successfully');
        if (onSaved) onSaved(res.data);
      } else {
        const res = await applicationService.create(formData);
        toast.success('Application tracked successfully');
        if (onSaved) onSaved(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application ? 'Edit Job Application' : 'Add New Job Application'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} className="app-modal-form">
        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Company Name *</label>
            <input
              type="text"
              name="companyName"
              className="input-field"
              placeholder="e.g. Google, Stripe, Uber"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              className="input-field"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="input-group">
            <label className="input-label">Status</label>
            <select
              name="status"
              className="select-field"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Source</label>
            <select
              name="source"
              className="select-field"
              value={formData.source}
              onChange={handleChange}
            >
              {SOURCE_OPTIONS.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Job Type</label>
            <select
              name="jobType"
              className="select-field"
              value={formData.jobType}
              onChange={handleChange}
            >
              {JOB_TYPE_OPTIONS.map((jt) => (
                <option key={jt} value={jt}>{jt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-3">
          <div className="input-group">
            <label className="input-label">Location</label>
            <input
              type="text"
              name="location"
              className="input-field"
              placeholder="e.g. Remote, San Francisco"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Salary / Compensation</label>
            <input
              type="text"
              name="salary"
              className="input-field"
              placeholder="e.g. $140,000 - $170,000"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Applied Date</label>
            <input
              type="date"
              name="appliedDate"
              className="input-field"
              value={formData.appliedDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Job Posting URL</label>
            <input
              type="url"
              name="jobUrl"
              className="input-field"
              placeholder="https://linkedin.com/jobs/view/..."
              value={formData.jobUrl}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Resume Used</label>
            <select
              name="resumeUsed"
              className="select-field"
              value={formData.resumeUsed}
              onChange={handleChange}
            >
              <option value="">-- Select Resume --</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} {r.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Application Notes</label>
          <input
            type="text"
            name="notes"
            className="input-field"
            placeholder="Recruiter contact, referral details, key talking points..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Job Description (For AI skill parsing & matching)</label>
          <textarea
            name="jobDescription"
            className="textarea-field"
            rows="4"
            placeholder="Paste raw job description here to enable automated AI skill extraction and keyword matching..."
            value={formData.jobDescription}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : application ? 'Save Changes' : 'Create Application'}
          </button>
        </div>
      </form>

      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }
        .textarea-field {
          resize: vertical;
          min-height: 80px;
        }
        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        @media (max-width: 640px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};
