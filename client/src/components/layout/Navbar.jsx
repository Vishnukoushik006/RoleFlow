import React from 'react';
import { Plus, Upload, Calendar, Search } from 'lucide-react';

export const Navbar = ({
  title,
  onOpenAddApp,
  onOpenUploadResume,
  onOpenAddInterview,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {onSearchChange && (
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search applications..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="quick-actions">
          {onOpenUploadResume && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenUploadResume}
              title="Upload resume"
            >
              <Upload size={13} />
              <span>Resume</span>
            </button>
          )}

          {onOpenAddInterview && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenAddInterview}
              title="Schedule interview"
            >
              <Calendar size={13} />
              <span>Interview</span>
            </button>
          )}

          {onOpenAddApp && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAddApp}
              title="Add job application"
            >
              <Plus size={14} />
              <span>Add Application</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          height: 56px;
          padding: 0 28px;
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .navbar-title {
          font-size: 15px;
          font-weight: 500;
          color: #edebe6;
          letter-spacing: -0.01em;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-wrap {
          position: relative;
          width: 260px;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #5a5552;
          pointer-events: none;
        }
        .navbar-search-input {
          width: 100%;
          padding: 7px 10px 7px 30px;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          color: #edebe6;
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.14s ease;
        }
        .navbar-search-input:focus {
          border-color: #c8956c;
        }
        .navbar-search-input::placeholder {
          color: #4a4846;
        }
        .quick-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 900px) {
          .navbar { padding: 0 16px; }
          .search-wrap { display: none; }
        }
      `}</style>
    </header>
  );
};
