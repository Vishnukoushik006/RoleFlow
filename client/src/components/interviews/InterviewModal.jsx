import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { interviewService, applicationService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';

const ROUND_TYPES = [
  'Phone Screen',
  'Technical Screening',
  'System Design',
  'Behavioral / HR',
  'Take-home Assessment',
  'Onsite',
  'Final Round',
  'Other'
];

export const InterviewModal = ({ isOpen, onClose, interview = null, defaultAppId = null, onSaved }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  const [formData, setFormData] = useState({
    applicationId: defaultAppId || '',
    round: 'Technical Round 1',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'Technical Screening',
    meetingUrl: '',
    interviewer: '',
    notes: '',
    topics: ''
  });

  useEffect(() => {
    if (isOpen) {
      applicationService.getAll({ limit: 100 }).then((res) => {
        if (res.success) setApplications(res.data);
      }).catch(() => {});

      if (interview) {
        setFormData({
          applicationId: interview.applicationId?._id || interview.applicationId || '',
          round: interview.round || '',
          date: interview.date ? new Date(interview.date).toISOString().split('T')[0] : '',
          time: interview.time || '10:00 AM',
          type: interview.type || 'Technical Screening',
          meetingUrl: interview.meetingUrl || '',
          interviewer: interview.interviewer || '',
          notes: interview.notes || '',
          topics: Array.isArray(interview.topics) ? interview.topics.join(', ') : ''
        });
      } else {
        setFormData({
          applicationId: defaultAppId || '',
          round: 'Technical Round 1',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          type: 'Technical Screening',
          meetingUrl: '',
          interviewer: '',
          notes: '',
          topics: ''
        });
      }
    }
  }, [isOpen, interview, defaultAppId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.applicationId || !formData.round.trim() || !formData.date) {
      toast.error('Application, Round Name, and Date are required');
      return;
    }

    setLoading(true);
    try {
      if (interview) {
        const res = await interviewService.update(interview._id, formData);
        toast.success('Interview updated');
        if (onSaved) onSaved(res.data);
      } else {
        const res = await interviewService.create(formData);
        toast.success('Interview scheduled & logged to timeline');
        if (onSaved) onSaved(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={interview ? 'Edit Interview Round' : 'Schedule Interview Round'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Application / Company *</label>
          <select
            name="applicationId"
            className="select-field"
            value={formData.applicationId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Application --</option>
            {applications.map((app) => (
              <option key={app._id} value={app._id}>
                {app.companyName} — {app.jobTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Round Name *</label>
            <input
              type="text"
              name="round"
              className="input-field"
              placeholder="e.g. System Design, Coding"
              value={formData.round}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Round Type</label>
            <select
              name="type"
              className="select-field"
              value={formData.type}
              onChange={handleChange}
            >
              {ROUND_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Date *</label>
            <input
              type="date"
              name="date"
              className="input-field"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Time</label>
            <input
              type="text"
              name="time"
              className="input-field"
              placeholder="e.g. 11:30 AM PST"
              value={formData.time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Meeting URL (Zoom, Meet, Teams)</label>
            <input
              type="url"
              name="meetingUrl"
              className="input-field"
              placeholder="https://meet.google.com/..."
              value={formData.meetingUrl}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Interviewer / Recruiter</label>
            <input
              type="text"
              name="interviewer"
              className="input-field"
              placeholder="e.g. Sarah Connor (Eng Mgr)"
              value={formData.interviewer}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Topics / Preparation Areas</label>
          <input
            type="text"
            name="topics"
            className="input-field"
            placeholder="e.g. DSA, Node.js, System Architecture"
            value={formData.topics}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Preparation Notes</label>
          <textarea
            name="notes"
            className="textarea-field"
            rows="3"
            placeholder="Key concepts to emphasize, questions to ask interviewer..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : interview ? 'Update Interview' : 'Schedule Interview'}
          </button>
        </div>
      </form>
      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }
        @media (max-width: 600px) {
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </Modal>
  );
};
