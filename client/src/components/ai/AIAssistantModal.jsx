import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { aiService, resumeService } from '../../services/domainServices';
import { useToast } from '../../context/ToastContext';
import { Sparkles, CheckCircle2, XCircle, FileText, ArrowRight, Zap, Target } from 'lucide-react';

export const AIAssistantModal = ({ isOpen, onClose, application }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'parse' | 'summarize'
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // AI results state
  const [matchResult, setMatchResult] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      resumeService.getAll().then((res) => {
        if (res.success && res.data.length > 0) {
          setResumes(res.data);
          // Default to the resume linked in application or default resume
          const defaultRes = res.data.find(r => r._id === application?.resumeUsed?._id || r.isDefault) || res.data[0];
          if (defaultRes) {
            setSelectedResumeId(defaultRes._id);
          }
        }
      }).catch(() => {});
    }
  }, [isOpen, application]);

  const handleRunMatch = async () => {
    if (!application?.jobDescription && (!application?.skills || application.skills.length === 0)) {
      toast.warning('No job description found on this application. Please edit the application and paste the job description first.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.matchResume({
        resumeId: selectedResumeId || undefined,
        applicationId: application._id,
        jobDescription: application.jobDescription
      });
      if (res.success) {
        setMatchResult(res.data);
        toast.success('Resume match analysis generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunParse = async () => {
    if (!application?.jobDescription) {
      toast.warning('No job description text found to parse.');
      return;
    }
    setLoading(true);
    try {
      const res = await aiService.parseJD(application.jobDescription);
      if (res.success) {
        setParseResult(res.data);
        toast.success('Job description extracted!');
      }
    } catch (err) {
      toast.error(err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSummarize = async () => {
    if (!application?.jobDescription) {
      toast.warning('No job description text found to summarize.');
      return;
    }
    setLoading(true);
    try {
      const res = await aiService.summarizeJD(application.jobDescription);
      if (res.success) {
        setSummaryResult(res.data);
        toast.success('Job summary generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Job & Resume Matcher — ${application?.companyName || 'Application'}`}
      maxWidth="720px"
    >
      <div className="ai-modal-container">
        {/* Navigation Tabs */}
        <div className="ai-tabs">
          <button
            className={`ai-tab ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            <Target size={15} />
            <span>Resume ↔ Job Match</span>
          </button>
          <button
            className={`ai-tab ${activeTab === 'parse' ? 'active' : ''}`}
            onClick={() => setActiveTab('parse')}
          >
            <Zap size={15} />
            <span>Skills Extractor</span>
          </button>
          <button
            className={`ai-tab ${activeTab === 'summarize' ? 'active' : ''}`}
            onClick={() => setActiveTab('summarize')}
          >
            <Sparkles size={15} />
            <span>Role Summary</span>
          </button>
        </div>

        {/* Tab 1: Resume Match */}
        {activeTab === 'match' && (
          <div className="ai-tab-content">
            <div className="match-controls">
              <div className="input-group mb-0">
                <label className="input-label">Select Resume Version to Compare</label>
                <div className="match-select-row">
                  <select
                    className="select-field"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.parsedSkills?.length || 0} skills identified)
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRunMatch}
                    disabled={loading || resumes.length === 0}
                  >
                    {loading ? 'Analyzing...' : 'Run Match Analysis'}
                  </button>
                </div>
              </div>
            </div>

            {matchResult ? (
              <div className="match-results-card">
                <div className="match-score-row">
                  <div className="score-circle">
                    <span className="score-num">{matchResult.matchPercentage}%</span>
                    <span className="score-label">Skill Alignment</span>
                  </div>
                  <div className="score-summary">
                    <h4>Alignment Overview</h4>
                    <p className="text-secondary text-sm">
                      Informational comparison between your resume skills and listed job requirements.
                    </p>
                  </div>
                </div>

                <div className="skills-breakdown-grid">
                  <div className="skills-col">
                    <div className="skills-col-header text-emerald">
                      <CheckCircle2 size={16} />
                      <span>Matching Skills ({matchResult.matchingSkills.length})</span>
                    </div>
                    <div className="skills-tag-cloud">
                      {matchResult.matchingSkills.map((sk) => (
                        <span key={sk} className="skill-pill-green">{sk}</span>
                      ))}
                      {matchResult.matchingSkills.length === 0 && (
                        <span className="text-muted text-xs">No direct skill matches found.</span>
                      )}
                    </div>
                  </div>

                  <div className="skills-col">
                    <div className="skills-col-header text-rose">
                      <XCircle size={16} />
                      <span>Missing / Desired Skills ({matchResult.missingSkills.length})</span>
                    </div>
                    <div className="skills-tag-cloud">
                      {matchResult.missingSkills.map((sk) => (
                        <span key={sk} className="skill-pill-red">{sk}</span>
                      ))}
                      {matchResult.missingSkills.length === 0 && (
                        <span className="text-muted text-xs">All listed job skills covered!</span>
                      )}
                    </div>
                  </div>
                </div>

                {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                  <div className="ai-recommendations">
                    <h5>Actionable Application Tips:</h5>
                    <ul>
                      {matchResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-empty-prompt">
                <Target size={30} color="#c8956c" />
                <p>Select your resume and click <strong>"Run Match Analysis"</strong> to compare skills and get tailoring tips.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Structured JD Parser */}
        {activeTab === 'parse' && (
          <div className="ai-tab-content">
            {!parseResult ? (
              <div className="ai-action-banner">
                <p>Extract technical languages, frameworks, education, and required experience level from the job description.</p>
                <button className="btn btn-primary btn-sm" onClick={handleRunParse} disabled={loading}>
                  {loading ? 'Extracting...' : 'Extract Structured Data'}
                </button>
              </div>
            ) : (
              <div className="parse-results">
                <div className="parsed-grid">
                  <div className="parsed-card">
                    <span className="parsed-label">Experience Requirement</span>
                    <span className="parsed-value">{parseResult.experienceRequirements || 'Not specified'}</span>
                  </div>
                  <div className="parsed-card">
                    <span className="parsed-label">Workplace & Type</span>
                    <span className="parsed-value">{parseResult.workplaceType || 'Remote'} ({parseResult.jobType || 'Full-time'})</span>
                  </div>
                  <div className="parsed-card full-width">
                    <span className="parsed-label">Education Requirement</span>
                    <span className="parsed-value">{parseResult.educationRequirements}</span>
                  </div>
                </div>

                <div className="parsed-section">
                  <h5>Extracted Technical Stack & Skills</h5>
                  <div className="skills-tag-cloud">
                    {parseResult.skills?.map((sk) => (
                      <span key={sk} className="skill-pill-blue">{sk}</span>
                    ))}
                  </div>
                </div>

                {parseResult.responsibilities && (
                  <div className="parsed-section">
                    <h5>Key Responsibilities Extracted</h5>
                    <ul className="resp-list">
                      {parseResult.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: JD Summary */}
        {activeTab === 'summarize' && (
          <div className="ai-tab-content">
            {!summaryResult ? (
              <div className="ai-action-banner">
                <p>Generate a high-level executive summary of this opportunity and key qualifications.</p>
                <button className="btn btn-primary btn-sm" onClick={handleRunSummarize} disabled={loading}>
                  {loading ? 'Summarizing...' : 'Generate Executive Summary'}
                </button>
              </div>
            ) : (
              <div className="summary-results">
                <div className="summary-card">
                  <h5>Executive Summary</h5>
                  <p className="summary-text">{summaryResult.shortSummary}</p>
                </div>
                {summaryResult.keyResponsibilities && (
                  <div className="summary-card">
                    <h5>Key Responsibilities</h5>
                    <ul className="resp-list">
                      {summaryResult.keyResponsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .ai-modal-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        .ai-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .ai-tab:hover {
          color: var(--text-main);
          background: var(--border);
        }
        .ai-tab.active {
          color: var(--text-main);
          background: var(--bg-surface);
          border-color: rgba(200, 149, 108, 0.35);
        }
        .match-select-row {
          display: flex;
          gap: 10px;
        }
        .match-results-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .match-score-row {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .score-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(74, 171, 124, 0.1);
          border: 2px solid #4aab7c;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .score-num {
          font-size: 18px;
          font-weight: 700;
          color: #4aab7c;
        }
        .score-label {
          font-size: 9px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .skills-breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .skills-col {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
        }
        .skills-col-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .text-emerald { color: #4aab7c; }
        .text-rose { color: #c86060; }
        .skills-tag-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .skill-pill-green {
          padding: 3px 8px;
          background: rgba(74, 171, 124, 0.15);
          color: #4aab7c;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 500;
        }
        .skill-pill-red {
          padding: 3px 8px;
          background: rgba(200, 96, 96, 0.15);
          color: #c86060;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 500;
        }
        .skill-pill-blue {
          padding: 3px 8px;
          background: rgba(200, 149, 108, 0.15);
          color: #c8956c;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 500;
        }
        .ai-recommendations {
          background: rgba(200, 149, 108, 0.06);
          border: 1px solid rgba(200, 149, 108, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
        }
        .ai-recommendations h5 {
          font-size: 13px;
          color: #c8956c;
          margin-bottom: 6px;
        }
        .ai-recommendations ul, .resp-list {
          padding-left: 18px;
          font-size: 12.5px;
          color: var(--text-main);
          line-height: 1.5;
        }
        .ai-empty-prompt, .ai-action-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 20px;
          text-align: center;
          gap: 12px;
          background: var(--bg-surface);
          border-radius: 10px;
          border: 1px dashed var(--border);
          font-size: 13px;
          color: var(--text-secondary);
        }
        .parsed-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .parsed-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
        }
        .parsed-card.full-width { grid-column: span 2; }
        .parsed-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px; }
        .parsed-value { font-size: 13px; color: var(--text-main); font-weight: 500; }
        .parsed-section, .summary-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .parsed-section h5, .summary-card h5 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .summary-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </Modal>
  );
};
