import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, SourceBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { analyticsService, applicationService } from '../services/domainServices';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle
} from 'lucide-react';

export const DashboardPage = ({
  onNavigate,
  onOpenAddApp,
  onOpenUploadResume,
  onOpenAddInterview
}) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsRes, appsRes] = await Promise.all([
          analyticsService.getDashboardMetrics(),
          applicationService.getAll({ limit: 6, sort: 'newest' })
        ]);
        if (analyticsRes.success) setMetrics(analyticsRes.data);
        if (appsRes.success) setRecentApps(appsRes.data);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return <Loader message="Loading dashboard intelligence..." />;
  }

  const statuses = [
    { label: 'Saved', count: metrics?.statusDistribution?.['Saved'] || 0, color: '#64748b' },
    { label: 'Applied', count: metrics?.statusDistribution?.['Applied'] || 0, color: '#3b82f6' },
    { label: 'Assessment', count: metrics?.statusDistribution?.['Assessment'] || 0, color: '#8b5cf6' },
    { label: 'Interview', count: metrics?.statusDistribution?.['Interview'] || 0, color: '#f59e0b' },
    { label: 'Offer', count: metrics?.statusDistribution?.['Offer'] || 0, color: '#10b981' },
    { label: 'Rejected', count: metrics?.statusDistribution?.['Rejected'] || 0, color: '#ef4444' },
    { label: 'Withdrawn', count: metrics?.statusDistribution?.['Withdrawn'] || 0, color: '#9ca3af' }
  ];

  return (
    <div className="dashboard-container">
      {/* KPI Cards Row */}
      <div className="grid-4 mb-6">
        <StatCard
          title="Total Applications"
          value={metrics?.totalApplications || 0}
          subtext="All tracked opportunities"
          icon={Briefcase}
          color="#c8956c"
        />
        <StatCard
          title="Applications This Week"
          value={metrics?.applicationsThisWeek || 0}
          subtext={`Avg: ${metrics?.averageApplicationsPerWeek || 0} / week`}
          icon={TrendingUp}
          color="#06b6d4"
        />
        <StatCard
          title="Interviews"
          value={metrics?.interviews || 0}
          subtext={`${metrics?.upcomingInterviews || 0} upcoming round(s)`}
          icon={Calendar}
          color="#f59e0b"
        />
        <StatCard
          title="Offers Received"
          value={metrics?.offers || 0}
          subtext={`${metrics?.offerRate || 0}% offer conversion`}
          icon={Award}
          color="#10b981"
        />
      </div>

      {/* Status Distribution Progress Bar */}
      <div className="card mb-6">
        <div className="flex-between mb-3">
          <h3 className="section-title mb-0">Application Pipeline Funnel</h3>
          <span className="text-muted text-xs">Real-time status breakdown</span>
        </div>

        <div className="status-funnel-bar">
          {statuses.map((st) => {
            const pct = metrics?.totalApplications > 0
              ? (st.count / metrics.totalApplications) * 100
              : 0;
            if (pct === 0) return null;
            return (
              <div
                key={st.label}
                className="funnel-segment"
                style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: st.color }}
                title={`${st.label}: ${st.count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        <div className="funnel-legend">
          {statuses.map((st) => (
            <div key={st.label} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: st.color }} />
              <span className="legend-name">{st.label}</span>
              <span className="legend-count">{st.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Row: Recent Applications & Upcoming Reminders */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Applications */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="section-title mb-0">Recent Applications</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('/applications')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentApps.length > 0 ? (
            <div className="recent-apps-list">
              {recentApps.map((app) => (
                <div
                  key={app._id}
                  className="recent-app-item"
                  onClick={() => onNavigate(`/applications/${app._id}`)}
                >
                  <div className="recent-app-left">
                    {app.companyLogo ? (
                      <img src={app.companyLogo} alt={app.companyName} className="app-logo" />
                    ) : (
                      <div className="app-logo-placeholder">
                        {app.companyName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                    <div className="app-info">
                      <span className="app-title-text">{app.jobTitle}</span>
                      <span className="app-company-text">
                        {app.companyName} &bull; {app.location || 'Remote'}
                      </span>
                    </div>
                  </div>
                  <div className="recent-app-right">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No applications tracked yet"
              description="Capture your first job application with the browser extension or add one manually."
              actionLabel="+ Add Application"
              onAction={onOpenAddApp}
            />
          )}
        </div>

        {/* Right Column: Quick Actions & Intelligence */}
        <div className="dashboard-side-col">
          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-col">
              <button className="btn btn-primary w-full justify-start" onClick={onOpenAddApp}>
                <Plus size={16} />
                <span>Add Job Application</span>
              </button>
              <button className="btn btn-secondary w-full justify-start" onClick={onOpenUploadResume}>
                <FileText size={16} />
                <span>Upload New Resume</span>
              </button>
              <button className="btn btn-secondary w-full justify-start" onClick={onOpenAddInterview}>
                <Calendar size={16} />
                <span>Schedule Interview</span>
              </button>
            </div>
          </div>

          {/* Productivity / Reminders Quick Card */}
          <div className="card mt-4">
            <div className="flex-between mb-3">
              <h3 className="section-title mb-0">Action Items</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('/reminders')}>
                <span>View</span>
              </button>
            </div>
            <div className="action-items-body">
              <div className="action-stat-pill">
                <Clock size={16} color="#f59e0b" />
                <span>{metrics?.pendingReminders || 0} Pending Follow-ups</span>
              </div>
              <div className="action-stat-pill mt-2">
                <Calendar size={16} color="#06b6d4" />
                <span>{metrics?.upcomingInterviews || 0} Scheduled Rounds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
        }
        .mb-0 { margin-bottom: 0 !important; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
        .justify-start { justify-content: flex-start; }

        .status-funnel-bar {
          display: flex;
          height: 5px;
          border-radius: 10px;
          overflow: hidden;
          background: #1a1a1a;
          gap: 2px;
        }
        .funnel-segment {
          height: 100%;
          transition: width 0.4s ease;
          opacity: 0.75;
        }
        .funnel-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          cursor: default;
        }
        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0.7;
        }
        .legend-name { color: #5a5552; }
        .legend-count {
          font-weight: 600;
          color: #c8c6c2;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .recent-apps-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .recent-app-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 12px;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .recent-app-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .recent-app-left {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }
        .app-logo {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          object-fit: cover;
          background: #fff;
          flex-shrink: 0;
        }
        .app-logo-placeholder {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.07);
          color: #5a5552;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }
        .app-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .app-title-text {
          font-size: 13px;
          font-weight: 500;
          color: #d0cdc8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .app-company-text {
          font-size: 11.5px;
          color: #4a4846;
        }
        .quick-actions-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .action-stat-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 7px;
          font-size: 12.5px;
          color: #8a8480;
          font-weight: 500;
        }
        @media (max-width: 960px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
