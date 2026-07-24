import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewCategories } from '../../constants';
import { getFullAnalytics, exportAnalyticsReport } from '../../services/analyticsService';
import { deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import SkillRadarChart from '../../components/analytics/SkillRadarChart';
import ScoreTimelineChart from '../../components/analytics/ScoreTimelineChart';
import DistributionCharts from '../../components/analytics/DistributionCharts';
import ActivityHeatmap from '../../components/analytics/ActivityHeatmap';
import WeaknessPriorityCard from '../../components/analytics/WeaknessPriorityCard';
import PracticePlanCard from '../../components/analytics/PracticePlanCard';
import BadgesMilestonesCard from '../../components/analytics/BadgesMilestonesCard';
import { formatDate } from '../../utils/helpers';
import '../History/History.css';
import './Dashboard.css';

/**
 * Dashboard Component (Day 15 AI Career Coach & SaaS Analytics Upgrade)
 * Renders executive analytics cards, AI insights, skill radar, score timeline,
 * weakness detection, 4-week practice roadmap, and report export buttons.
 */
function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setLoading(true);
    setError('');
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let active = true;
    async function loadFullAnalyticsData() {
      try {
        const response = await getFullAnalytics();
        const data = response?.data || response;
        if (active) {
          setAnalyticsData(data);
          setError('');
        }
      } catch (err) {
        console.error('Error loading analytics payload:', err);
        if (active) {
          setError(err.message || 'Failed to connect to the analytics server.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadFullAnalyticsData();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const summary = analyticsData?.summary || {};
  const categories = analyticsData?.categories || {};
  const charts = analyticsData?.charts || {};
  const insights = analyticsData?.insights || {};
  const weaknesses = analyticsData?.weaknesses || {};
  const practicePlan = analyticsData?.practicePlan || {};
  const milestones = analyticsData?.milestones || {};
  const recentInterviews = analyticsData?.history?.interviews || [];

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      addToast('Generating CSV Analytics Report...', 'info');
      await exportAnalyticsReport('csv');
      addToast('CSV Analytics downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export CSV report.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      addToast('Opening print view for PDF export...', 'info');
      window.print();
    } catch (err) {
      console.error(err);
      addToast('Failed to initiate PDF print.', 'error');
    }
  };

  const handleStartMock = (categoryName) => {
    const catObj = interviewCategories.find((c) => c.title === categoryName);
    const role =
      categoryName.includes('DSA') || categoryName.includes('Algorithms')
        ? 'Software Engineer'
        : categoryName.includes('Frontend')
        ? 'Frontend Developer'
        : categoryName.includes('Backend')
        ? 'Backend Developer'
        : 'HR Specialist';

    navigate('/interview-setup', {
      state: {
        role,
        difficulty: catObj?.difficulty || 'Medium'
      }
    });
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setSelectedDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await deleteInterview(selectedDeleteId);
      addToast('Interview record deleted successfully.', 'success');
      triggerRefresh();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete interview record.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner-container text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
          <h3 className="h5 text-light mt-3 fw-bold">Analyzing Career Intelligence Data...</h3>
          <p className="text-secondary">Computing category ratings, progress trends, and practice roadmaps.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="state-container error my-5">
          <div className="state-icon-wrapper">⚠️</div>
          <h3>Analytics Server Offline</h3>
          <p>{error}</p>
          <div>
            <button className="state-btn" onClick={triggerRefresh}>Retry Connection</button>
            <button className="state-btn-secondary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-glow-orb dashboard-orb-1"></div>

      {/* Header Bar with Action Export Buttons */}
      <header className="dashboard-header d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <div className="header-badge mb-2">
            <span className="badge-icon">⚡</span>
            <span>AI CAREER COACH DASHBOARD</span>
          </div>
          <h1 className="h2 fw-bold text-light mb-1">Executive Career & Practice Intelligence</h1>
          <p className="text-secondary mb-0">Personalized AI insights, skill progress radar, weakness detection, and practice roadmaps.</p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <span>📥</span> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 fw-bold"
            onClick={handleExportPDF}
          >
            <span>📄</span> Export PDF Report
          </button>
        </div>
      </header>

      {/* SaaS Metric Cards Grid (Part 6) */}
      <section className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Overall Score"
            value={`${summary.averageScore || 0}%`}
            icon="🏆"
            trend={summary.improvementPercentage}
            trendDirection={summary.trendDetection === 'Improving' ? 'up' : summary.trendDetection === 'Declining' ? 'down' : 'stable'}
            subtitle="Current rating avg"
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Highest Score"
            value={`${summary.highestScore || 0}%`}
            icon="⭐"
            badgeText="Peak"
            badgeColor="success"
            subtitle="Personal record"
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Latest Session"
            value={`${summary.latestScore || 0}%`}
            icon="⚡"
            subtitle={`Trend: ${summary.trendDetection || 'Stable'}`}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Total Sessions"
            value={summary.totalInterviews || 0}
            icon="📋"
            progress={summary.completionRate}
            subtitle={`${summary.completedInterviews || 0} Completed`}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Learning Velocity"
            value={insights.learningVelocity || 'Steady'}
            icon="🚀"
            badgeText={`${summary.weeklyCount || 0} This Wk`}
            badgeColor="info"
            subtitle="Pacing metric"
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2">
          <AnalyticsCard
            title="Readiness Index"
            value={`${insights.readinessScore || 75}/100`}
            icon="🎯"
            badgeText={insights.readinessScore >= 80 ? 'Ready' : 'In Progress'}
            badgeColor={insights.readinessScore >= 80 ? 'success' : 'warning'}
            subtitle="AI readiness score"
          />
        </div>
      </section>

      {/* AI Career Coach Insights Box (Part 2) */}
      {insights.observations && insights.observations.length > 0 && (
        <section className="card bg-dark text-light border border-info border-opacity-25 rounded-4 p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 fw-bold mb-0 text-info d-flex align-items-center gap-2">
              <span>🤖</span> AI Career Coach Intelligence Observations
            </h3>
            <span className="badge bg-info-subtle text-info border border-info fs-8">
              Confidence: {summary.aiRecommendationConfidence || 85}%
            </span>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <ul className="mb-0 ps-3 text-light d-flex flex-column gap-2 fs-7">
                {insights.observations.map((obs, idx) => (
                  <li key={idx} className="lh-base">💡 {obs}</li>
                ))}
              </ul>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-25 h-100">
                <h5 className="fs-8 fw-bold text-secondary text-uppercase mb-2">Target Focus Areas</h5>
                <div className="d-flex flex-wrap gap-1">
                  {insights.recommendedFocusAreas?.map((area, aIdx) => (
                    <span key={aIdx} className="badge bg-primary-subtle text-primary border border-primary fs-8">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Visual Analytics Charts Grid (Part 3) */}
      <section className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <SkillRadarChart data={charts.radar} />
        </div>

        <div className="col-12 col-lg-6">
          <ScoreTimelineChart data={charts.scoreTimeline} />
        </div>
      </section>

      <section className="mb-4">
        <DistributionCharts typeData={charts.typeDoughnut} difficultyData={charts.difficultyBar} />
      </section>

      {/* Weakness Detection & 4-Week Practice Plan Roadmap (Parts 4 & 5) */}
      <section className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <WeaknessPriorityCard data={weaknesses} />
        </div>

        <div className="col-12 col-lg-6">
          <ActivityHeatmap activityMap={charts.activityMap} />
        </div>
      </section>

      <section className="mb-4">
        <PracticePlanCard data={practicePlan} />
      </section>

      {/* Milestones, Streaks & Readiness Meter (Bonus Part 12) */}
      <section className="mb-4">
        <BadgesMilestonesCard data={milestones} readinessScore={insights.readinessScore || 75} />
      </section>

      {/* Recent Practice Sessions Table */}
      <section className="recent-sessions-section mt-5">
        <h2 className="h4 fw-bold text-light mb-3">Recent Simulated Interview Sessions</h2>
        {recentInterviews.length > 0 ? (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mock Practice Title</th>
                  <th>Practice Topic / Role</th>
                  <th>Difficulty</th>
                  <th>Completed On</th>
                  <th>Overall Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInterviews.map((item) => (
                  <tr
                    key={item._id}
                    className="history-row"
                    onClick={() => item.status === 'completed' && navigate(`/results?id=${item._id}`)}
                  >
                    <td>
                      <span className="history-item-title">{item.title}</span>
                    </td>
                    <td>
                      <span className="history-item-role">{item.role}</span>
                    </td>
                    <td>
                      <span className={`difficulty-pill ${item.difficulty?.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="history-item-date">{formatDate(item.createdAt)}</span>
                    </td>
                    <td>
                      <span className="history-item-score">
                        {item.status === 'completed' ? (
                          item.overallScore !== null && item.overallScore !== undefined ? (
                            item.overallScore <= 10 ? `${item.overallScore} / 10` : `${item.overallScore}%`
                          ) : '—'
                        ) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${item.status}`}>
                        {item.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="history-actions-cell" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'completed' ? (
                          <button className="btn-table-action view" onClick={() => navigate(`/results?id=${item._id}`)}>
                            View Report
                          </button>
                        ) : (
                          <button className="btn-table-action start" onClick={() => navigate('/interview', { state: { id: item._id } })}>
                            Start Mock
                          </button>
                        )}
                        <button className="btn-table-action delete" onClick={(e) => handleDeleteClick(item._id, e)} title="Delete Session">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-container text-center py-4">
            <div className="state-icon-wrapper">📦</div>
            <h3>No Practice Sessions Recorded</h3>
            <p>Select a practice track below to launch your first simulated AI interview panel.</p>
            <button className="state-btn" onClick={() => navigate('/interview-setup')}>Start Mock Interview</button>
          </div>
        )}
      </section>

      {/* Available Session Tracks */}
      <section className="roles-section mt-5">
        <h2 className="h4 fw-bold text-light mb-3">Choose Your Practice Domain</h2>
        <div className="roles-grid">
          {interviewCategories.map((category) => (
            <div key={category.id} className="role-card">
              <div className="role-card-header">
                <span className={`difficulty-pill ${category.theme}`}>
                  {category.difficulty}
                </span>
                <span className="question-count">
                  <span className="icon-badge">{category.icon}</span> {category.questions} Questions
                </span>
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <button
                className="btn-start-role-mock"
                onClick={() => handleStartMock(category.title)}
              >
                Start Interview
                <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Interview Record?"
        message="Are you sure you want to permanently delete this practice record? This operation is destructive and cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
