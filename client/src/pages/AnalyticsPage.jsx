import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { Loader } from '../components/common/Loader';
import { analyticsService } from '../services/domainServices';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  PieChart,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  Target
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsService.getDashboardMetrics()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <Loader message="Compiling analytics & job search metrics..." />;
  }

  const total = data.totalApplications || 1;

  return (
    <div className="analytics-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Application Analytics & Intelligence</h2>
          <p className="page-subtitle">Real-time metrics, pipeline conversion rates, and sourcing insights.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        <StatCard
          title="Total Applications"
          value={data.totalApplications}
          subtext="Lifetime tracked"
          icon={Briefcase}
          color="#c8956c"
        />
        <StatCard
          title="Applications This Month"
          value={data.applicationsThisMonth}
          subtext={`Avg: ${data.averageApplicationsPerWeek} / wk`}
          icon={TrendingUp}
          color="#06b6d4"
        />
        <StatCard
          title="Interview Rate"
          value={`${data.interviewRate}%`}
          subtext={`${data.interviews} interview round(s)`}
          icon={Target}
          color="#f59e0b"
        />
        <StatCard
          title="Offer Rate"
          value={`${data.offerRate}%`}
          subtext={`${data.offers} confirmed offer(s)`}
          icon={Award}
          color="#10b981"
        />
      </div>

      {/* Grid: Status Distribution & Weekly Cadence */}
      <div className="analytics-grid mb-6">
        {/* Weekly Cadence Bar Chart */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="section-title mb-0">
              <BarChart3 size={18} color="#c8956c" />
              <span>Weekly Application Volume</span>
            </h3>
            <span className="text-muted text-xs">Past 6 weeks</span>
          </div>

          <div className="cadence-chart-wrap">
            {data.weeklyCadence && data.weeklyCadence.map((w, idx) => {
              const maxCount = Math.max(...data.weeklyCadence.map((item) => item.count), 5);
              const heightPct = Math.max((w.count / maxCount) * 100, 8);

              return (
                <div key={idx} className="cadence-bar-col">
                  <span className="cadence-count-label">{w.count}</span>
                  <div className="cadence-bar-track">
                    <div
                      className="cadence-bar-fill"
                      style={{ height: `${heightPct}%` }}
                      title={`${w.label}: ${w.count} applications`}
                    />
                  </div>
                  <span className="cadence-week-label">{w.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pipeline Breakdown */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="section-title mb-0">
              <PieChart size={18} color="#06b6d4" />
              <span>Status Pipeline Breakdown</span>
            </h3>
          </div>

          <div className="status-bars-list">
            {Object.entries(data.statusDistribution || {}).map(([st, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={st} className="status-bar-row">
                  <div className="status-bar-header">
                    <span className="status-bar-name">{st}</span>
                    <span className="status-bar-val">{count} ({pct}%)</span>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className={`status-bar-fill fill-${st.toLowerCase()}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Sourcing Breakdown & Top Locations */}
      <div className="analytics-grid">
        {/* Sourcing Breakdown */}
        <div className="card">
          <h3 className="section-title mb-4">
            <Briefcase size={18} color="#f59e0b" />
            <span>Applications by Source</span>
          </h3>

          <div className="sources-list">
            {Object.entries(data.sourceDistribution || {}).map(([src, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={src} className="source-item-row">
                  <span className="source-name">{src}</span>
                  <div className="source-bar-wrap">
                    <div className="source-bar-fill" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                  <span className="source-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Locations & Job Types */}
        <div className="card">
          <h3 className="section-title mb-4">
            <MapPin size={18} color="#10b981" />
            <span>Top Locations & Work Types</span>
          </h3>

          <div className="locations-list">
            {data.topLocations && data.topLocations.map((loc, idx) => (
              <div key={idx} className="location-item-row">
                <div className="loc-rank">{idx + 1}</div>
                <span className="loc-name">{loc.name}</span>
                <span className="loc-count">{loc.count} job(s)</span>
              </div>
            ))}
            {(!data.topLocations || data.topLocations.length === 0) && (
              <span className="text-muted text-xs">No location data available yet.</span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
        }
        .page-header-row {
          margin-bottom: 24px;
        }
        .mb-6 { margin-bottom: 24px; }
        .mb-4 { margin-bottom: 16px; }
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Cadence Chart */
        .cadence-chart-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 190px;
          padding-top: 20px;
          gap: 12px;
        }
        .cadence-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: 6px;
        }
        .cadence-count-label {
          font-size: 11px;
          font-weight: 700;
          color: #c8956c;
        }
        .cadence-bar-track {
          width: 100%;
          max-width: 44px;
          height: 130px;
          background: var(--bg-surface);
          border-radius: 6px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .cadence-bar-fill {
          width: 100%;
          background: #c8956c;
          border-radius: 6px 6px 0 0;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cadence-week-label {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Status Bars */
        .status-bars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .status-bar-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .status-bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .status-bar-name { font-weight: 600; color: var(--text-secondary); }
        .status-bar-val { color: var(--text-secondary); font-family: var(--font-mono); }
        .status-bar-track {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .status-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .fill-saved { background: var(--status-saved); }
        .fill-applied { background: var(--status-applied); }
        .fill-assessment { background: var(--status-assessment); }
        .fill-interview { background: var(--status-interview); }
        .fill-offer { background: var(--status-offer); }
        .fill-rejected { background: var(--status-rejected); }
        .fill-withdrawn { background: var(--status-withdrawn); }

        /* Sourcing List */
        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .source-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12.5px;
        }
        .source-name {
          width: 120px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .source-bar-wrap {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .source-bar-fill {
          height: 100%;
          background: #c8956c;
          border-radius: 4px;
        }
        .source-count {
          width: 30px;
          text-align: right;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Location list */
        .locations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .location-item-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-surface);
          border-radius: 6px;
          font-size: 12.5px;
        }
        .loc-rank {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--border);
          color: var(--text-main);
          font-weight: 700;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loc-name { flex: 1; color: var(--text-main); font-weight: 600; }
        .loc-count { color: var(--text-secondary); }

        @media (max-width: 860px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
