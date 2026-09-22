import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Loader } from './components/common/Loader';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Modals
import { ApplicationModal } from './components/applications/ApplicationModal';
import { ResumeUploadModal } from './components/resumes/ResumeUploadModal';
import { InterviewModal } from './components/interviews/InterviewModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { KanbanPage } from './pages/KanbanPage';
import { ResumesPage } from './pages/ResumesPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { RemindersPage } from './pages/RemindersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Global quick modals
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [isAddInterviewModalOpen, setIsAddInterviewModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <Loader message="Initializing JobTrack ecosystem..." />
      </div>
    );
  }

  // If not authenticated, route to Login / Register / Forgot Password / Reset Password
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }
    const resetMatch = currentPath.match(/^\/reset-password\/?([a-zA-Z0-9_-]*)$/);
    if (resetMatch) {
      return <ResetPasswordPage onNavigate={navigate} token={resetMatch[1] || ''} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  // Extract application ID if on /applications/:id
  const appDetailMatch = currentPath.match(/^\/applications\/([a-zA-Z0-9_-]+)$/);
  const detailId = appDetailMatch ? appDetailMatch[1] : null;

  // Determine page title
  let pageTitle = 'Dashboard';
  if (currentPath.startsWith('/applications') && !detailId) pageTitle = 'Applications';
  else if (detailId) pageTitle = 'Application Details';
  else if (currentPath.startsWith('/kanban')) pageTitle = 'Kanban Board';
  else if (currentPath.startsWith('/resumes')) pageTitle = 'Resume Vault';
  else if (currentPath.startsWith('/interviews')) pageTitle = 'Interviews';
  else if (currentPath.startsWith('/reminders')) pageTitle = 'Reminders';
  else if (currentPath.startsWith('/analytics')) pageTitle = 'Analytics';
  else if (currentPath.startsWith('/settings')) pageTitle = 'Settings';

  return (
    <div className="app-container">
      {/* Responsive Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={navigate} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          title={pageTitle}
          onOpenAddApp={() => setIsAddAppModalOpen(true)}
          onOpenUploadResume={() => setIsUploadResumeModalOpen(true)}
          onOpenAddInterview={() => setIsAddInterviewModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={currentPath.startsWith('/applications') ? setSearchQuery : null}
        />

        <main className="page-body">
          <ErrorBoundary onReset={() => navigate('/dashboard')}>
            {detailId && (
              <ApplicationDetailPage key={`detail-${detailId}-${refreshKey}`} id={detailId} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/applications') && (
              <ApplicationsPage key={`apps-${refreshKey}`} onNavigate={navigate} searchQuery={searchQuery} />
            )}

            {!detailId && currentPath.startsWith('/kanban') && (
              <KanbanPage key={`kanban-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/resumes') && (
              <ResumesPage key={`resumes-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/interviews') && (
              <InterviewsPage key={`interviews-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/reminders') && (
              <RemindersPage key={`reminders-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/analytics') && (
              <AnalyticsPage key={`analytics-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId && currentPath.startsWith('/settings') && (
              <SettingsPage key={`settings-${refreshKey}`} onNavigate={navigate} />
            )}

            {!detailId &&
              (currentPath === '/' ||
                currentPath === '/dashboard' ||
                currentPath === '/login' ||
                currentPath === '/register') && (
                <DashboardPage
                  key={`dashboard-${refreshKey}`}
                  onNavigate={navigate}
                  onOpenAddApp={() => setIsAddAppModalOpen(true)}
                  onOpenUploadResume={() => setIsUploadResumeModalOpen(true)}
                  onOpenAddInterview={() => setIsAddInterviewModalOpen(true)}
                />
              )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals */}
      <ApplicationModal
        isOpen={isAddAppModalOpen}
        onClose={() => setIsAddAppModalOpen(false)}
        onSaved={() => {
          triggerRefresh();
        }}
      />

      <ResumeUploadModal
        isOpen={isUploadResumeModalOpen}
        onClose={() => setIsUploadResumeModalOpen(false)}
        onUploaded={() => {
          triggerRefresh();
        }}
      />

      <InterviewModal
        isOpen={isAddInterviewModalOpen}
        onClose={() => setIsAddInterviewModalOpen(false)}
        onSaved={() => {
          triggerRefresh();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
