import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const SOURCE_FILTERS = ['All', 'LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Greenhouse', 'Lever', 'Glassdoor', 'Wellfound', 'Other'];
const JOB_TYPE_FILTERS = ['All', 'Full-time', 'Contract', 'Internship', 'Part-time', 'Remote'];
const SORT_OPTIONS = [
  { label: 'Newest Applied', value: 'newest' },
  { label: 'Oldest Applied', value: 'oldest' },
  { label: 'Company (A to Z)', value: 'company_asc' },
  { label: 'Company (Z to A)', value: 'company_desc' },
  { label: 'Recently Updated', value: 'updated_desc' }
];

export const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="select-field select-sm"
          value={filters.status || 'All'}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Source</label>
        <select
          className="select-field select-sm"
          value={filters.source || 'All'}
          onChange={(e) => onFilterChange('source', e.target.value)}
        >
          {SOURCE_FILTERS.map((src) => (
            <option key={src} value={src}>{src === 'All' ? 'All Sources' : src}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Job Type</label>
        <select
          className="select-field select-sm"
          value={filters.jobType || 'All'}
          onChange={(e) => onFilterChange('jobType', e.target.value)}
        >
          {JOB_TYPE_FILTERS.map((jt) => (
            <option key={jt} value={jt}>{jt === 'All' ? 'All Types' : jt}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Sort By</label>
        <select
          className="select-field select-sm"
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button className="btn btn-ghost btn-sm btn-reset" onClick={onReset} title="Reset Filters">
        <RotateCcw size={13} />
        <span>Reset</span>
      </button>

      <style>{`
        .filter-panel {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .select-sm {
          padding: 6px 10px;
          font-size: 12.5px;
          width: auto;
          min-width: 130px;
        }
        .btn-reset {
          margin-left: auto;
        }
        @media (max-width: 768px) {
          .filter-panel {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-reset {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
