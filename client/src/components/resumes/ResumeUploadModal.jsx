import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { resumeService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';
import { Upload, FileText } from 'lucide-react';

export const ResumeUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a resume file to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('targetRoles', targetRoles);
    formData.append('isDefault', isDefault);

    try {
      const res = await resumeService.upload(formData);
      toast.success('Resume uploaded and skills parsed!');
      if (onUploaded) onUploaded(res.data);
      onClose();
      // Reset form
      setFile(null);
      setName('');
      setTargetRoles('');
      setIsDefault(false);
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New Resume" maxWidth="500px">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Resume File (PDF, DOCX, TXT) *</label>
          <div className="file-drop-zone">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              id="resume-file-input"
              className="file-hidden-input"
              required
            />
            <label htmlFor="resume-file-input" className="file-drop-label">
              <Upload size={22} color="#c8956c" />
              {file ? (
                <span className="file-chosen-name">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                <>
                  <span className="drop-main">Click or drop resume file here</span>
                  <span className="drop-sub">PDF, DOCX up to 10MB</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Resume Name / Version Label *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. SWE Resume v2, ML Engineer Resume"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Target Roles (Comma-separated)</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Frontend Engineer, Full Stack, React Dev"
            value={targetRoles}
            onChange={(e) => setTargetRoles(e.target.value)}
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span>Set as default resume for new applications</span>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading & Parsing...' : 'Upload Resume'}
          </button>
        </div>
      </form>

      <style>{`
        .file-drop-zone {
          border: 1px dashed var(--border-hover);
          border-radius: 8px;
          background: var(--bg-surface);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .file-drop-zone:hover {
          border-color: #c8956c;
        }
        .file-hidden-input {
          display: none;
        }
        .file-drop-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .drop-main {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }
        .drop-sub {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .file-chosen-name {
          font-size: 13px;
          font-weight: 700;
          color: #10b981;
        }
        .checkbox-group {
          margin: 12px 0 18px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
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
