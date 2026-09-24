import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/domainServices';
import {
  User,
  Shield,
  Sparkles,
  Copy,
  Check,
  Chrome,
  Save,
  Download,
  Key,
  FolderDown
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'Software Engineer',
    location: user?.location || '',
    bio: user?.bio || '',
    defaultJobType: user?.settings?.defaultJobType || 'Full-time',
    defaultSource: user?.settings?.defaultSource || 'LinkedIn'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile({
        name: formData.name,
        targetRole: formData.targetRole,
        location: formData.location,
        bio: formData.bio,
        settings: {
          defaultJobType: formData.defaultJobType,
          defaultSource: formData.defaultSource
        }
      });
      if (res.success) {
        updateUser(res.user);
        toast.success('Settings updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success('Extension API Token copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadExtension = () => {
    const link = document.createElement('a');
    link.href = '/api/extension/download';
    link.download = 'roleflow-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Extension download started!');
  };

  return (
    <div className="settings-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Account & Extension Settings</h2>
          <p className="page-subtitle">Configure your profile, defaults, and Chrome extension integration.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Settings */}
        <div className="card">
          <h3 className="section-title mb-4">
            <User size={16} color="#c8956c" />
            <span>Profile & Job Preferences</span>
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="input-field"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="input-field"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div className="input-group">
              <label className="input-label">Target Role / Career Goal</label>
              <input
                type="text"
                name="targetRole"
                className="input-field"
                placeholder="e.g. Senior Backend Engineer"
                value={formData.targetRole}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Preferred Location</label>
              <input
                type="text"
                name="location"
                className="input-field"
                placeholder="e.g. San Francisco / Remote"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Career Bio / Summary</label>
              <textarea
                name="bio"
                className="textarea-field"
                rows="3"
                placeholder="Short background summary..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
              <Save size={15} />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Chrome Extension Integration */}
        <div className="card">
          <h3 className="section-title mb-4">
            <Chrome size={18} color="#06b6d4" />
            <span>Chrome Browser Extension</span>
          </h3>

          {/* Download Button */}
          <button
            type="button"
            className="btn-download-ext"
            onClick={handleDownloadExtension}
          >
            <Download size={18} />
            <div className="btn-download-text">
              <span className="btn-download-title">Download Extension</span>
              <span className="btn-download-sub">roleflow-extension.zip · Chrome / Edge / Brave</span>
            </div>
          </button>

          <div className="ext-instructions-box">
            <h4>Install in 4 steps:</h4>
            <ol className="setup-steps">
              <li>
                Click <strong>"Download Extension"</strong> above to get the <code>.zip</code> file.
              </li>
              <li>
                Unzip the downloaded file to any folder on your computer.
              </li>
              <li>
                Open Chrome → <code>chrome://extensions</code> → enable <strong>"Developer mode"</strong> → click <strong>"Load unpacked"</strong> → select the unzipped <code>roleflow-extension</code> folder.
              </li>
              <li>
                Pin RoleFlow to your toolbar and start tracking jobs with one click!
              </li>
            </ol>
          </div>

          <div className="token-section mt-4">
            <label className="input-label">Your Session Token (For Extension Sync)</label>
            <div className="token-box">
              <input
                type="password"
                className="input-field font-mono"
                value={token || ''}
                readOnly
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyToken}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <span className="text-muted text-xs mt-1">
              The extension automatically reads your session if logged in on the same browser, or you can paste this token manually into the extension popup.
            </span>
          </div>

          <div className="supported-sites-box mt-4">
            <span className="supported-label">Supported Job Portals:</span>
            <div className="sites-pills">
              <span className="site-pill">LinkedIn</span>
              <span className="site-pill">Indeed</span>
              <span className="site-pill">Naukri</span>
              <span className="site-pill">Greenhouse.io</span>
              <span className="site-pill">Lever.co</span>
              <span className="site-pill">Company Career Pages</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          display: flex;
          flex-direction: column;
        }
        .page-header-row {
          margin-bottom: 24px;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .btn-download-ext {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: rgba(200, 149, 108, 0.08);
          border: 1px solid rgba(200, 149, 108, 0.25);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 18px;
          color: #c8956c;
        }
        .btn-download-ext:hover {
          background: rgba(200, 149, 108, 0.14);
          border-color: rgba(200, 149, 108, 0.4);
          transform: translateY(-1px);
        }
        .btn-download-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .btn-download-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .btn-download-sub {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .setup-steps {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 8px;
        }
        .setup-steps code {
          background: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
          color: var(--text-main);
          border: 1px solid var(--border);
        }
        .token-box {
          display: flex;
          gap: 8px;
        }
        .supported-sites-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .supported-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .sites-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .site-pill {
          padding: 3px 8px;
          background: rgba(200, 149, 108, 0.1);
          color: #c8956c;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 600;
        }
        @media (max-width: 860px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
