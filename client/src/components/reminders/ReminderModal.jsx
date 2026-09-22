import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { reminderService, applicationService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';

export const ReminderModal = ({ isOpen, onClose, reminder = null, defaultAppId = null, onSaved }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  const [formData, setFormData] = useState({
    applicationId: defaultAppId || '',
    title: '',
    description: '',
    reminderDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      applicationService.getAll({ limit: 100 }).then((res) => {
        if (res.success) setApplications(res.data);
      }).catch(() => {});

      if (reminder) {
        setFormData({
          applicationId: reminder.applicationId?._id || reminder.applicationId || '',
          title: reminder.title || '',
          description: reminder.description || '',
          reminderDate: reminder.reminderDate ? new Date(reminder.reminderDate).toISOString().split('T')[0] : ''
        });
      } else {
        setFormData({
          applicationId: defaultAppId || '',
          title: '',
          description: '',
          reminderDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, reminder, defaultAppId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.reminderDate) {
      toast.error('Title and Date are required');
      return;
    }

    setLoading(true);
    try {
      if (reminder) {
        const res = await reminderService.update(reminder._id, formData);
        toast.success('Reminder updated');
        if (onSaved) onSaved(res.data);
      } else {
        const res = await reminderService.create(formData);
        toast.success('Reminder scheduled');
        if (onSaved) onSaved(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reminder ? 'Edit Reminder' : 'Set Application Reminder'}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Linked Application (Optional)</label>
          <select
            className="select-field"
            value={formData.applicationId}
            onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
          >
            <option value="">-- General Reminder (No Application) --</option>
            {applications.map((app) => (
              <option key={app._id} value={app._id}>
                {app.companyName} — {app.jobTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Reminder Title *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Follow up with recruiter on LinkedIn"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Due Date *</label>
          <input
            type="date"
            className="input-field"
            value={formData.reminderDate}
            onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Details / Notes</label>
          <textarea
            className="textarea-field"
            rows="3"
            placeholder="Additional context or notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : reminder ? 'Save Reminder' : 'Create Reminder'}
          </button>
        </div>
      </form>
      <style>{`
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }
      `}</style>
    </Modal>
  );
};
