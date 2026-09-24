import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  FileText,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/applications', icon: Briefcase },
    { label: 'Kanban', path: '/kanban', icon: KanbanSquare },
    { label: 'Resumes', path: '/resumes', icon: FileText },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Reminders', path: '/reminders', icon: Bell },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      {/* Wordmark */}
      <div className="sidebar-brand">
        <span className="brand-mark">●</span>
        <span className="brand-name">RoleFlow</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Extension hint */}
      <div className="extension-hint">
        <div className="ext-hint-top">
          <Zap size={12} />
          <span>Chrome Extension</span>
        </div>
        <p>Capture jobs from any board in one click.</p>
        <a
          href="/api/extension/download"
          download="roleflow-extension.zip"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '8px', textAlign: 'center', textDecoration: 'none', display: 'block' }}
        >
          ↓ Download .zip
        </a>
        <button
          className="btn-text"
          style={{ width: '100%', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', cursor: 'pointer', background: 'none', border: 'none' }}
          onClick={() => onNavigate('/settings')}
        >
          Setup instructions →
        </button>
      </div>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.targetRole || 'Job Seeker'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 220px;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          min-height: 100vh;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 22px 18px 18px;
          border-bottom: 1px solid var(--border);
        }
        .brand-mark {
          font-size: 10px;
          color: #c8956c;
          line-height: 1;
        }
        .brand-name {
          font-size: 15px;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .sidebar-nav {
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--text-muted);
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 450;
          cursor: pointer;
          transition: color 0.12s ease, background 0.12s ease;
          text-align: left;
          width: 100%;
          letter-spacing: -0.01em;
        }
        .nav-item:hover {
          color: var(--text-main);
          background: var(--border);
        }
        .nav-item.active {
          color: var(--text-main);
          background: var(--bg-surface);
          font-weight: 500;
        }
        .extension-hint {
          margin: 0 10px 12px;
          padding: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .ext-hint-top {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #c8956c;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .extension-hint p {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .sidebar-footer {
          padding: 14px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-app);
        }
        .user-row {
          display: flex;
          align-items: center;
          gap: 9px;
          overflow: hidden;
          min-width: 0;
        }
        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: #c8956c;
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .user-name {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-main);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .user-role {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .logout-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: color 0.12s ease;
        }
        .logout-btn:hover {
          color: #c86060;
        }
        @media (max-width: 860px) {
          .sidebar { width: 56px; }
          .brand-name, .nav-item span, .extension-hint, .user-meta, .logout-btn { display: none; }
          .sidebar-brand { padding: 18px 0; justify-content: center; }
          .nav-item { justify-content: center; padding: 10px; }
          .sidebar-footer { justify-content: center; padding: 10px 0; }
        }
      `}</style>
    </aside>
  );
};
