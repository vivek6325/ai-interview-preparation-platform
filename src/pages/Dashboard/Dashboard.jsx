import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Star,
  Zap,
  BarChart3,
  Target,
  Brain,
  Sparkles,
  Flame,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Clock,
  Activity,
  Award,
  Download,
  Printer,
  TrendingUp,
  Compass,
  PlayCircle,
  Trash2,
  Eye,
  Layers,
  ChevronRight
} from 'lucide-react';
import { interviewCategories } from '../../constants';
import { getFullAnalytics, exportAnalyticsReport } from '../../services/analyticsService';
import { deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import InsightCard from '../../components/dashboard/InsightCard';

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
 * Dashboard Component (Executive Redesign)
 * CSS Grid layout (~1400px centered) with Header Hero card, 6 Metric Cards,
 * 2-column Chart grid, AI Insights, Weakness analysis, 4-Week Practice Plan roadmap,
 * and Recent Sessions table.
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
      <div className="dashboard-page-wrapper">
        <div className="dashboard-grid-container text-center py-5">
          <div className="spinner-border text-indigo" style={{ width: '3rem', height: '3rem' }}></div>
          <h3 className="h5 text-light mt-3 fw-bold">Analyzing Career Intelligence Data...</h3>
          <p className="text-secondary">Computing skill ratings, progress trends, and practice roadmaps.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page-wrapper">
        <div className="dashboard-grid-container">
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
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      <div className="dashboard-bg-glow"></div>

      <div className="dashboard-grid-container">
        {/* SECTION 1: HEADER HERO BANNER */}
        <DashboardHeader
          userName="Candidate"
          streakDays={milestones?.currentStreak || 5}
          readinessScore={insights.readinessScore || 78}
          onStartSession={() => navigate('/interview-setup')}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          exporting={exporting}
        />

        {/* SECTION 2: 6 METRIC CARDS GRID */}
        <section className="metrics-6-grid">
          <MetricCard
            title="Overall Score"
            value={`${summary.averageScore || 0}%`}
            icon={Trophy}
            trend={summary.improvementPercentage}
            trendDirection={summary.trendDetection === 'Improving' ? 'up' : summary.trendDetection === 'Declining' ? 'down' : 'stable'}
            subtitle="Current rating avg"
            accentColor="indigo"
          />

          <MetricCard
            title="Highest Score"
            value={`${summary.highestScore || 0}%`}
            icon={Star}
            badgeText="Peak Record"
            badgeColor="success"
            subtitle="Personal best"
            accentColor="emerald"
          />

          <MetricCard
            title="Latest Session"
            value={`${summary.latestScore || 0}%`}
            icon={Zap}
            subtitle={`Trend: ${summary.trendDetection || 'Stable'}`}
            accentColor="sky"
          />

          <MetricCard
            title="Total Sessions"
            value={summary.totalInterviews || 0}
            icon={BarChart3}
            progress={summary.completionRate}
            subtitle={`${summary.completedInterviews || 0} Completed`}
            accentColor="violet"
          />

          <MetricCard
            title="Learning Velocity"
            value={insights.learningVelocity || 'Steady'}
            icon={TrendingUp}
            badgeText={`${summary.weeklyCount || 0} This Wk`}
            badgeColor="info"
            subtitle="Pacing metric"
            accentColor="amber"
          />

          <MetricCard
            title="AI Readiness"
            value={`${insights.readinessScore || 78}/100`}
            icon={Target}
            badgeText={insights.readinessScore >= 80 ? 'Ready' : 'In Progress'}
            badgeColor={insights.readinessScore >= 80 ? 'success' : 'warning'}
            subtitle="Interview readiness"
            accentColor="indigo"
          />
        </section>

        {/* SECTION 3: 2-COLUMN CHARTS GRID */}
        <section className="charts-2col-grid mb-5">
          <div className="grid-card chart-grid-item">
            <SkillRadarChart data={charts.radar} />
          </div>

          <div className="grid-card chart-grid-item">
            <ScoreTimelineChart data={charts.scoreTimeline} />
          </div>
        </section>

        {/* SECTION 4: TYPE & DIFFICULTY DISTRIBUTIONS */}
        <section className="mb-5">
          <DistributionCharts typeData={charts.typeDoughnut} difficultyData={charts.difficultyBar} />
        </section>

        {/* SECTION 5: AI CAREER INSIGHTS GRID */}
        {insights.observations && insights.observations.length > 0 && (
          <section className="dashboard-section mb-5">
            <div className="section-title-row">
              <h2 className="section-heading">
                <Brain className="icon-heading text-indigo" size={22} />
                AI Career Coach Observations
              </h2>
              <span className="confidence-pill">
                Confidence Rating: {summary.aiRecommendationConfidence || 85}%
              </span>
            </div>

            <div className="insights-cards-grid">
              {insights.observations.map((obs, idx) => (
                <InsightCard key={idx} observation={obs} index={idx} />
              ))}
            </div>

            {insights.recommendedFocusAreas && insights.recommendedFocusAreas.length > 0 && (
              <div className="focus-areas-strip">
                <span className="strip-label">Target Focus Topics:</span>
                <div className="strip-pills">
                  {insights.recommendedFocusAreas.map((area, aIdx) => (
                    <span key={aIdx} className="focus-pill">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION 6: WEAKNESS DETECTION & ACTIVITY HEATMAP */}
        <section className="charts-2col-grid mb-5">
          <div className="grid-card">
            <WeaknessPriorityCard data={weaknesses} />
          </div>

          <div className="grid-card">
            <ActivityHeatmap activityMap={charts.activityMap} />
          </div>
        </section>

        {/* SECTION 7: 4-WEEK PRACTICE ROADMAP */}
        <section className="mb-5">
          <PracticePlanCard data={practicePlan} />
        </section>

        {/* SECTION 8: MILESTONES & STREAKS */}
        <section className="mb-5">
          <BadgesMilestonesCard data={milestones} readinessScore={insights.readinessScore || 78} />
        </section>

        {/* SECTION 9: RECENT SESSIONS TABLE */}
        <section className="dashboard-section mb-5">
          <div className="section-title-row">
            <h2 className="section-heading">
              <Activity className="icon-heading text-emerald" size={22} />
              Recent Practice Sessions
            </h2>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => navigate('/history')}
            >
              View Full Vault →
            </button>
          </div>

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
                  {recentInterviews.slice(0, 5).map((item) => (
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
                            <Trash2 size={14} />
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

        {/* SECTION 10: PRACTICE DOMAIN TRACKS */}
        <section className="dashboard-section">
          <div className="section-title-row">
            <h2 className="section-heading">
              <Compass className="icon-heading text-sky" size={22} />
              Choose Your Practice Track
            </h2>
          </div>

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
                  <span>Start Interview</span>
                  <ChevronRight size={16} className="arrow" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

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
