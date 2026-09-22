import React, { useState, useEffect, useCallback } from 'react';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { FilterPanel } from '../components/applications/FilterPanel';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { applicationService } from '../services/domainServices';
import { useToast } from '../context/ToastContext';
import { Plus, LayoutGrid, List } from 'lucide-react';

export const ApplicationsPage = ({ onNavigate, searchQuery }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: 'All',
    source: 'All',
    jobType: 'All',
    sort: 'newest'
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppForEdit, setSelectedAppForEdit] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAll({
        ...filters,
        search: searchQuery
      });
      if (res.success) {
        setApplications(res.data);
        setTotalCount(res.total);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'All',
      source: 'All',
      jobType: 'All',
      sort: 'newest'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application and its history?')) {
      try {
        await applicationService.delete(id);
        toast.success('Application deleted');
        fetchApplications();
      } catch (err) {
        toast.error('Error deleting application');
      }
    }
  };

  const handleEdit = (app) => {
    setSelectedAppForEdit(app);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAppForEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="applications-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Applications ({totalCount})</h2>
          <p className="page-subtitle">Track, filter, and organize all your job submissions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} />
          <span>Add Application</span>
        </button>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <Loader message="Loading applications..." />
      ) : applications.length > 0 ? (
        <ApplicationTable
          applications={applications}
          onSelectApp={(id) => onNavigate(`/applications/${id}`)}
          onEditApp={handleEdit}
          onDeleteApp={handleDelete}
        />
      ) : (
        <EmptyState
          title="No applications matched your criteria"
          description="Try broadening your search filters or click below to track a new job application."
          actionLabel="+ Add Application"
          onAction={handleCreate}
        />
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={selectedAppForEdit}
        onSaved={fetchApplications}
      />

      <style>{`
        .applications-page {
          display: flex;
          flex-direction: column;
        }
        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};
