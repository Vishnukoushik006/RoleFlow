import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { applicationService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';

const EVENT_TYPES = [
  'Status Changed',
  'Assessment Received',
  'Assessment Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Recruiter Contacted',
  'Offer Received',
  'Rejected',
  'Note Added',
  'Custom'
];

export const AddEventModal = ({ isOpen, onClose, applicationId, onEventAdded }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState('Assessment Received');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setLoading(true);
    try {
      const res = await applicationService.addEvent(applicationId, {
        eventType,
        description: description.trim(),
        date
      });
      toast.success('Timeline event added!');
      if (onEventAdded) onEventAdded(res.data);
      onClose();
      setDescription('');
    } catch (err) {
      toast.error(err.message || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Timeline Event" maxWidth="480px">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Event Category *</label>
          <select
            className="select-field"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Date *</label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Event Description *</label>
          <textarea
            className="textarea-field"
            rows="3"
            placeholder="e.g. Received HackerRank 90-minute coding assessment link..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Event to Timeline'}
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
