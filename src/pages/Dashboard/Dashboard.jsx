import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewCategories } from '../../constants';
import { getDashboardAnalytics, deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/helpers';
import '../History/History.css';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Renders user prep analytics summary and cards representing target roles.
 * Fetches real interview session analytics from the backend on load.
 */
function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [currentTime] = useState(() => Date.now());

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setLoading(true);
    setError('');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let active = true;
    async function loadDashboardData() {
      try {
        const response = await getDashboardAnalytics();
        const data = response?.data || response;
        if (active) {
          setAnalytics(data);
          setError('');
        }
      } catch (err) {
        console.error('Error loading dashboard analytics:', err);
        if (active) {
          setError(err.message || 'Failed to connect to the backend server.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadDashboardData();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const completedList = useMemo(() => {
    return (analytics?.recentInterviews || []).filter(i => i.status === 'completed');
  }, [analytics]);

  const stats = useMemo(() => {
    const completedCount = analytics?.completedInterviews || 0;
    const avgScoreRaw = analytics?.averageScore || 0;
    const maxScoreRaw = analytics?.highestScore || 0;
    const monthlyCount = analytics?.monthlyInterviews || 0;
    const totalCount = analytics?.totalInterviews || 0;

    const recentCompleted = (analytics?.recentInterviews || []).filter(i => i.status === 'completed');
    let trend = 'Complete a mock practice to start tracking';
    if (recentCompleted.length > 1) {
      const sortedByDate = [...recentCompleted].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const lastScore = sortedByDate[sortedByDate.length - 1].overallScore || 0;
      const prevScore = sortedByDate[sortedByDate.length - 2].overallScore || 0;
      const diff = lastScore - prevScore;
      if (diff > 0) {
        trend = `Up +${diff.toFixed(1)} score last session`;
      } else if (diff < 0) {
        trend = `Down -${Math.abs(diff).toFixed(1)} score last session`;
      } else {
        trend = 'Maintained last score';
      }
    } else if (recentCompleted.length === 1) {
      trend = 'First milestone unlocked';
    }

    const topicScores = {};
    recentCompleted.forEach(item => {
      const topic = item.title?.replace(' Mock Practice', '').replace(' Mock', '') || 'Other';
      if (!topicScores[topic]) {
        topicScores[topic] = [];
      }
      topicScores[topic].push(item.overallScore || 0);
    });
    
    let strongest = 'None';
    let weakest = 'None';
    let maxAvg = -1;
    let minAvg = 11;
    
    Object.keys(topicScores).forEach(topic => {
      const avgTopic = topicScores[topic].reduce((s, v) => s + v, 0) / topicScores[topic].length;
      if (avgTopic > maxAvg) {
        maxAvg = avgTopic;
        strongest = topic;
      }
      if (avgTopic < minAvg) {
        minAvg = avgTopic;
        weakest = topic;
      }
    });

    return {
      totalCompleted: completedCount,
      totalInterviews: totalCount,
      avgScore: avgScoreRaw,
      highestScore: maxScoreRaw,
      monthlyInterviews: monthlyCount,
      totalPracticeTime: completedCount * 5,
      strongestTopic: strongest,
      weakestTopic: weakest,
      trend
    };
  }, [analytics]);

  // Handle starting a specific mock interview session
  const handleStartMock = (categoryName) => {
    const catObj = interviewCategories.find(c => c.title === categoryName);
    const role = categoryName.includes('DSA') || categoryName.includes('Algorithms') ? 'Software Engineer' :
                 categoryName.includes('Frontend') ? 'Frontend Developer' :
                 categoryName.includes('Backend') ? 'Backend Developer' : 'HR Specialist';
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
      addToast('Interview deleted successfully.', 'success');
      setFetchedInterviews(prev => prev.filter(item => item._id !== selectedDeleteId));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete interview.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  // SVG Chart Render logic
  const renderCharts = () => {
    if (completedList.length === 0) {
      return (
        <div className="empty-charts-state">
          <p>📊 Visual analytics will appear here after you finish your first practice mock.</p>
        </div>
      );
    }

    const nowTime = currentTime || 1774000000000;
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weeklyCounts = [0, 0, 0, 0];

    completedList.forEach(item => {
      const createdTime = new Date(item.createdAt).getTime();
      const diffMs = nowTime - createdTime;
      if (diffMs >= 0 && diffMs < oneWeekMs) {
        weeklyCounts[3]++;
      } else if (diffMs >= oneWeekMs && diffMs < 2 * oneWeekMs) {
        weeklyCounts[2]++;
      } else if (diffMs >= 2 * oneWeekMs && diffMs < 3 * oneWeekMs) {
        weeklyCounts[1]++;
      } else if (diffMs >= 3 * oneWeekMs && diffMs < 4 * oneWeekMs) {
        weeklyCounts[0]++;
      }
    });

    const maxWeeklyCount = Math.max(...weeklyCounts, 3);

    const chrono = [...completedList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const points = chrono.map((item, idx) => {
      const x = chrono.length > 1 ? (idx / (chrono.length - 1)) * 360 + 50 : 230;
      const y = 150 - ((item.overallScore || 0) / 10) * 110;
      return { x, y, score: item.overallScore, date: new Date(item.createdAt).toLocaleDateString() };
    });

    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaPath = linePath + ` L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;
    }

    const categoryTotals = { DSA: [], Frontend: [], Backend: [], HR: [] };
    completedList.forEach(item => {
      const t = item.title?.toLowerCase() || '';
      if (t.includes('data') || t.includes('dsa') || t.includes('algorithm')) categoryTotals.DSA.push(item.overallScore || 0);
      else if (t.includes('front') || t.includes('react')) categoryTotals.Frontend.push(item.overallScore || 0);
      else if (t.includes('back') || t.includes('database')) categoryTotals.Backend.push(item.overallScore || 0);
      else if (t.includes('hr') || t.includes('human')) categoryTotals.HR.push(item.overallScore || 0);
    });

    const categoryScores = Object.keys(categoryTotals).map(cat => {
      const list = categoryTotals[cat];
      const avg = list.length > 0 ? parseFloat((list.reduce((s, v) => s + v, 0) / list.length).toFixed(1)) : 0;
      return { name: cat, score: avg };
    });

    const easyNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'easy').length;
    const medNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'medium').length;
    const hardNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'hard').length;
    const totalDiff = easyNum + medNum + hardNum;
    
    const radius = 35;
    const circ = 2 * Math.PI * radius;
    const easyPct = totalDiff > 0 ? easyNum / totalDiff : 0;
    const medPct = totalDiff > 0 ? medNum / totalDiff : 0;

    const easyOffset = circ;
    const medOffset = circ - (easyPct * circ);
    const hardOffset = circ - ((easyPct + medPct) * circ);

    return (
      <div className="analytics-dashboard-grid">
        <div className="chart-card">
          <h4>Score Progression Trend</h4>
          <div className="svg-chart-container">
            <svg viewBox="0 0 460 180" width="100%" height="100%">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <line x1="40" y1="40" x2="420" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="95" x2="420" y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="150" x2="420" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              
              <text x="15" y="44" fill="var(--text-muted)" fontSize="9" fontWeight="700">10.0</text>
              <text x="15" y="99" fill="var(--text-muted)" fontSize="9" fontWeight="700">5.0</text>
              <text x="15" y="154" fill="var(--text-muted)" fontSize="9" fontWeight="700">0.0</text>

              {points.length > 0 && (
                <>
                  <path d={areaPath} fill="url(#chartGlow)" />
                  <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
                  {points.map((p, i) => (
                    <g key={i} className="chart-dot-group">
                      <circle cx={p.x} cy={p.y} r="5.5" fill="#fff" stroke="var(--primary)" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y} r="10" fill="transparent" style={{ cursor: 'pointer' }} />
                      <title>Session {i+1}: {p.score}/10 on {p.date}</title>
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>
          <div className="chart-legend-row">
            <span>&bull; Horizontal axis tracks sequential mock practices</span>
          </div>
        </div>

        <div className="chart-card">
          <h4>Performance by Topic</h4>
          <div className="bar-chart-layout">
            {categoryScores.map((cat, idx) => (
              <div key={idx} className="bar-row">
                <span className="bar-row-label">{cat.name}</span>
                <div className="bar-row-track-container">
                  <div className="bar-row-track">
                    <div 
                      className="bar-row-fill" 
                      style={{ 
                        width: `${cat.score * 10}%`,
                        background: cat.name === 'DSA' ? 'var(--danger)' : 
                                    cat.name === 'Frontend' ? 'var(--primary)' :
                                    cat.name === 'Backend' ? 'var(--accent)' : 'var(--success)'
                      }}
                    ></div>
                  </div>
                </div>
                <span className="bar-row-score-value">{cat.score > 0 ? `${cat.score}/10` : '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card donut-chart-card">
          <h4>Difficulty Distribution</h4>
          <div className="donut-chart-flex">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                {easyNum > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--success)" strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={easyOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                )}
                {medNum > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#a5b4fc" strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={medOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                )}
                {hardNum > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--danger)" strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={hardOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                )}
              </svg>
              <div className="donut-center-label">
                <span className="count">{totalDiff}</span>
                <span className="lbl">Taken</span>
              </div>
            </div>

            <div className="donut-legend">
              <div className="legend-item"><span className="legend-color-dot" style={{ background: 'var(--success)' }}></span> Easy: {easyNum}</div>
              <div className="legend-item"><span className="legend-color-dot" style={{ background: '#a5b4fc' }}></span> Med: {medNum}</div>
              <div className="legend-item"><span className="legend-color-dot" style={{ background: 'var(--danger)' }}></span> Hard: {hardNum}</div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h4>Weekly Practice Trend</h4>
          <div className="svg-chart-container">
            <svg viewBox="0 0 240 120" width="100%" height="100%">
              <line x1="20" y1="25" x2="220" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="60" x2="220" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="95" x2="220" y2="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              
              <text x="5" y="28" fill="var(--text-muted)" fontSize="8" fontWeight="700">{maxWeeklyCount}</text>
              <text x="5" y="63" fill="var(--text-muted)" fontSize="8" fontWeight="700">{Math.round(maxWeeklyCount / 2)}</text>
              <text x="5" y="98" fill="var(--text-muted)" fontSize="8" fontWeight="700">0</text>

              {weeklyCounts.map((count, idx) => {
                const barHeight = (count / maxWeeklyCount) * 70;
                const x = 35 + idx * 50;
                const y = 95 - barHeight;
                return (
                  <g key={idx} className="weekly-bar-group">
                    <rect 
                      x={x} 
                      y={y} 
                      width="20" 
                      height={barHeight} 
                      rx="4" 
                      ry="4" 
                      fill="url(#barGradient)" 
                    />
                    <text x={x + 10} y={y - 6} fill="var(--accent)" fontSize="8" fontWeight="800" textAnchor="middle">
                      {count > 0 ? count : ''}
                    </text>
                  </g>
                );
              })}

              <text x="45" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">3w ago</text>
              <text x="95" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">2w ago</text>
              <text x="145" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">1w ago</text>
              <text x="195" y="112" fill="var(--text-secondary)" fontSize="8" fontWeight="700" textAnchor="middle">This Wk</text>

              <defs>
                <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="chart-legend-row">
            <span>&bull; Mocks completed per weekly interval</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <h3>Retrieving Your Progress...</h3>
          <p>Please hold on while we communicate with the cloud database.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Interview Prep Dashboard</h1>
          <p>Track your analytical progress and launch simulated AI interview panels.</p>
        </header>

        <div className="state-container error">
          <div className="state-icon-wrapper">⚠️</div>
          <h3>Database Connection Failed</h3>
          <p>{error}</p>
          <div>
            <button className="state-btn" onClick={triggerRefresh}>Retry Loading</button>
            <button className="state-btn-secondary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-glow-orb dashboard-orb-1"></div>
      
      <header className="dashboard-header">
        <div className="header-badge">
          <span className="badge-icon"></span>
          <span>AI POWERED PLATFORM</span>
        </div>
        <h1>Interview Prep Dashboard</h1>
        <p>Track your analytical progress, review trends, and launch mock interviews.</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div className="stat-info">
            <span className="stat-label">Total Sessions</span>
            <span className="stat-value">{stats.totalInterviews} Mock{stats.totalInterviews !== 1 && 's'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-label">Interviews Completed</span>
            <span className="stat-value">{stats.totalCompleted} Mock{stats.totalCompleted !== 1 && 's'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div className="stat-info">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">{stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-label">Highest Score</span>
            <span className="stat-value">{stats.highestScore > 0 ? `${stats.highestScore}%` : '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-info">
            <span className="stat-label">This Month</span>
            <span className="stat-value">{stats.monthlyInterviews} Practice{stats.monthlyInterviews !== 1 && 's'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✨</span>
          <div className="stat-info">
            <span className="stat-label">Improvement Trend</span>
            <span className="stat-value" style={{ fontSize: '1.05rem', marginTop: '0.45rem', lineHeight: '1.3' }}>{stats.trend}</span>
          </div>
        </div>
      </section>

      <section className="analytics-collapsible-wrapper">
        <button className="btn-analytics-toggle" onClick={() => setShowAnalytics(!showAnalytics)}>
          <span>📊 Performance Analytics &amp; Progression Insights</span>
          <span className="toggle-chevron">{showAnalytics ? '▲' : '▼'}</span>
        </button>
        {showAnalytics && (
          <div className="analytics-collapsible-content">
            {renderCharts()}
          </div>
        )}
      </section>

      {/* Unlocked Achievements Section */}
      {(() => {
        const getAchievements = () => {
          const list = [];
          if (stats.totalCompleted >= 1) {
            list.push({
              id: 'novice',
              title: 'STAR Novice',
              description: 'Completed first AI mock practice.',
              icon: '🥇',
              color: '#10b981',
              theme: 'easy'
            });
          }
          if (stats.totalCompleted >= 3) {
            list.push({
              id: 'veteran',
              title: 'Prep Veteran',
              description: 'Completed 3+ mock sessions.',
              icon: '🏆',
              color: '#6366f1',
              theme: 'medium'
            });
          }
          if (stats.avgScore >= 8.0) {
            list.push({
              id: 'communicator',
              title: 'Elite Speaker',
              description: 'Scored 8.0+ average in speech depth.',
              icon: '⚡',
              color: '#22d3ee',
              theme: 'hard'
            });
          }
          if (stats.avgScore >= 7.0) {
            list.push({
              id: 'practitioner',
              title: 'STAR Practitioner',
              description: 'Maintained benchmark >= 7.0 overall rating.',
              icon: '🎯',
              color: '#a855f7',
              theme: 'medium'
            });
          }
          return list;
        };
        const achievements = getAchievements();
        if (achievements.length === 0) return null;

        return (
          <section className="achievements-section" style={{ marginTop: '3rem' }}>
            <h2 className="achievements-title">Unlocked Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((ach) => (
                <div key={ach.id} className={`achievement-badge-card ${ach.theme}`}>
                  <span className="achievement-icon" style={{ textShadow: `0 0 10px ${ach.color}` }}>{ach.icon}</span>
                  <div className="achievement-info">
                     <h4>{ach.title}</h4>
                     <p>{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Recent Practice Sessions (List/Table of Interviews) */}
      <section className="recent-sessions-section" style={{ marginTop: '4rem' }}>
        <h2>Recent Practice Sessions</h2>
        {(analytics?.recentInterviews || []).length > 0 ? (
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
                {analytics.recentInterviews.map((item) => (
                  <tr key={item._id} className="history-row" onClick={() => item.status === 'completed' && navigate(`/results?id=${item._id}`)}>
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
                        <button className="btn-table-action delete" onClick={(e) => handleDeleteClick(item._id, e)} title="Delete Practice Session">
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
          <div className="state-container" style={{ margin: '1.5rem auto' }}>
            <div className="state-icon-wrapper">📦</div>
            <h3>No Interviews Yet</h3>
            <p>Your practice history is empty. Start your preparation by taking your first mock interview!</p>
            <button className="state-btn" onClick={() => navigate('/interview-setup')}>Start First Interview</button>
          </div>
        )}
      </section>

      {/* Available Session Tracks */}
      <section className="roles-section" style={{ marginTop: '4rem' }}>
        <h2>Choose Your Practice Domain</h2>
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

      {/* Custom Confirmation Dialog Modal Overlay */}
      <ConfirmationModal 
        isOpen={deleteModalOpen}
        title="Delete Interview Record?"
        message="Are you sure you want to permanently delete this practice record and all of its feedback metrics? This operation is destructive and cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
