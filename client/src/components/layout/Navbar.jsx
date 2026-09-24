import React from 'react';
import { Plus, Upload, Calendar, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({
  title,
  onOpenAddApp,
  onOpenUploadResume,
  onOpenAddInterview,
  searchQuery,
  onSearchChange
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

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
            <button className="btn btn-secondary btn-sm" onClick={onOpenUploadResume} title="Upload resume">
              <Upload size={13} />
              <span>Resume</span>
            </button>
          )}

          {onOpenAddInterview && (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAddInterview} title="Schedule interview">
              <Calendar size={13} />
              <span>Interview</span>
            </button>
          )}

          {onOpenAddApp && (
            <button className="btn btn-primary btn-sm" onClick={onOpenAddApp} title="Add job application">
              <Plus size={14} />
              <span>Add Application</span>
            </button>
          )}

          <button className="theme-toggle" onClick={toggleTheme} title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          height: 56px;
          padding: 0 28px;
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
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
          color: var(--text-main);
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
          color: var(--text-muted);
          pointer-events: none;
        }
        .navbar-search-input {
          width: 100%;
          padding: 7px 10px 7px 30px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-main);
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.14s ease;
        }
        .navbar-search-input:focus { border-color: #c8956c; }
        .navbar-search-input::placeholder { color: var(--text-muted); }
        .quick-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
        }
        .theme-toggle:hover {
          background: var(--bg-surface-light);
          color: var(--text-main);
          border-color: var(--border-hover);
        }
        @media (max-width: 900px) {
          .navbar { padding: 0 16px; }
          .search-wrap { display: none; }
        }
      `}</style>
    </header>
  );
};
