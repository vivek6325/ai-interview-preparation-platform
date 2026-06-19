import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewCategories } from '../../constants';
import { getInterviews } from '../../services/api';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Renders user prep analytics summary and cards representing target roles.
 * Clicking a role button navigates the user to the Interview route.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('normal');
  const [fetchedInterviews, setFetchedInterviews] = useState([]);
  const [currentTime] = useState(() => Date.now());
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const response = await getInterviews();
        const list = response?.data?.interviews || response || [];
        setFetchedInterviews(list);
      } catch (error) {
        console.error('Error loading interviews:', error);
      }
    }
    loadInterviews();
  }, []);

  const completedList = useMemo(() => {
    if (demoState === 'normal') {
      return fetchedInterviews.filter(i => i.status === 'completed');
    } else if (demoState === 'empty') {
      return [];
    } else {
      const refTime = currentTime;
      return [
        { title: 'Frontend Developer Mock', overallScore: 7.2, createdAt: new Date(refTime - 25 * 24 * 60 * 60 * 1000).toISOString(), difficulty: 'Medium' },
        { title: 'DSA Practice Mock', overallScore: 6.8, createdAt: new Date(refTime - 18 * 24 * 60 * 60 * 1000).toISOString(), difficulty: 'Hard' },
        { title: 'Frontend Developer Mock', overallScore: 8.5, createdAt: new Date(refTime - 10 * 24 * 60 * 60 * 1000).toISOString(), difficulty: 'Medium' },
        { title: 'Backend Developer Mock', overallScore: 8.2, createdAt: new Date(refTime - 3 * 24 * 60 * 60 * 1000).toISOString(), difficulty: 'Easy' },
        { title: 'Frontend Developer Mock', overallScore: 9.0, createdAt: new Date(refTime - 1 * 24 * 60 * 60 * 1000).toISOString(), difficulty: 'Hard' },
      ];
    }
  }, [fetchedInterviews, demoState, currentTime]);

  const stats = useMemo(() => {
    if (demoState === 'empty') {
      return {
        totalCompleted: 0,
        avgScore: 0,
        strongestTopic: 'N/A',
        weakestTopic: 'N/A',
        totalPracticeTime: 0,
        trend: 'No sessions recorded'
      };
    }
    
    if (demoState !== 'normal') {
      return {
        totalCompleted: 12,
        avgScore: 8.2,
        strongestTopic: 'Frontend',
        weakestTopic: 'DSA',
        totalPracticeTime: 60,
        trend: 'Up +0.8 score last session'
      };
    }

    if (completedList.length === 0) {
      return {
        totalCompleted: 0,
        avgScore: 0,
        strongestTopic: 'None',
        weakestTopic: 'None',
        totalPracticeTime: 0,
        trend: 'Complete a mock practice to start tracking'
      };
    }

    const totalScores = completedList.reduce((sum, item) => sum + (item.overallScore || 0), 0);
    const avg = parseFloat((totalScores / completedList.length).toFixed(1));
    
    const topicScores = {};
    completedList.forEach(item => {
      const topic = item.title?.replace(' Mock Practice', '').replace(' Mock', '') || 'Other';
      if (!topicScores[topic]) {
        topicScores[topic] = [];
      }
      topicScores[topic].push(item.overallScore || 0);
    });
    
    let strongest = 'N/A';
    let weakest = 'N/A';
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
    
    const practiceTime = completedList.length * 5;
    
    let trend;
    if (completedList.length > 1) {
      const sortedByDate = [...completedList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
    } else {
      trend = 'First milestone unlocked';
    }

    return {
      totalCompleted: completedList.length,
      avgScore: avg,
      strongestTopic: strongest,
      weakestTopic: weakest,
      totalPracticeTime: practiceTime,
      trend
    };
  }, [completedList, demoState]);

  // Handle starting a specific mock interview session
  const handleStartMock = (categoryName) => {
    navigate('/interview', { state: { category: categoryName } });
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

    // Weekly practice trend calculation (last 4 weeks relative to today)
    const nowTime = currentTime || 1774000000000;
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weeklyCounts = [0, 0, 0, 0]; // Index 0: Week 1 (oldest), Index 3: Week 4 (current)

    completedList.forEach(item => {
      const createdTime = new Date(item.createdAt).getTime();
      const diffMs = nowTime - createdTime;
      if (diffMs >= 0 && diffMs < oneWeekMs) {
        weeklyCounts[3]++; // This Week
      } else if (diffMs >= oneWeekMs && diffMs < 2 * oneWeekMs) {
        weeklyCounts[2]++; // 1 Week Ago
      } else if (diffMs >= 2 * oneWeekMs && diffMs < 3 * oneWeekMs) {
        weeklyCounts[1]++; // 2 Weeks Ago
      } else if (diffMs >= 3 * oneWeekMs && diffMs < 4 * oneWeekMs) {
        weeklyCounts[0]++; // 3 Weeks Ago
      }
    });

    const maxWeeklyCount = Math.max(...weeklyCounts, 3);

    // Chronological points for line chart
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

    // Category breakdown math
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

    // Difficulty breakdown distribution
    const easyNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'easy').length;
    const medNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'medium').length;
    const hardNum = completedList.filter(i => i.difficulty?.toLowerCase() === 'hard').length;
    const totalDiff = easyNum + medNum + hardNum;
    
    // Donut chart stroke math
    const radius = 35;
    const circ = 2 * Math.PI * radius;
    const easyPct = totalDiff > 0 ? easyNum / totalDiff : 0;
    const medPct = totalDiff > 0 ? medNum / totalDiff : 0;

    const easyOffset = circ;
    const medOffset = circ - (easyPct * circ);
    const hardOffset = circ - ((easyPct + medPct) * circ);

    return (
      <div className="analytics-dashboard-grid">
        {/* Progression Line Chart */}
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
              
              {/* Horizontal Grid lines */}
              <line x1="40" y1="40" x2="420" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="95" x2="420" y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="150" x2="420" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              
              {/* Axis markers */}
              <text x="15" y="44" fill="var(--text-muted)" fontSize="9" fontWeight="700">10.0</text>
              <text x="15" y="99" fill="var(--text-muted)" fontSize="9" fontWeight="700">5.0</text>
              <text x="15" y="154" fill="var(--text-muted)" fontSize="9" fontWeight="700">0.0</text>

              {points.length > 0 && (
                <>
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#chartGlow)" />
                  {/* Glowing line */}
                  <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* Interactive Dot indicators */}
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

        {/* Topic Breakdown Bar Chart */}
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

        {/* Donut Difficulty Chart */}
        <div className="chart-card donut-chart-card">
          <h4>Difficulty Distribution</h4>
          <div className="donut-chart-flex">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                
                {/* Easy circle slice */}
                {easyNum > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--success)" strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={easyOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                )}
                
                {/* Medium circle slice */}
                {medNum > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#a5b4fc" strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={medOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                )}

                {/* Hard circle slice */}
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

        {/* Weekly Practice Trend Card */}
        <div className="chart-card">
          <h4>Weekly Practice Trend</h4>
          <div className="svg-chart-container">
            <svg viewBox="0 0 240 120" width="100%" height="100%">
              {/* Grid lines */}
              <line x1="20" y1="25" x2="220" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="60" x2="220" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="95" x2="220" y2="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              
              {/* Y Axis Labels */}
              <text x="5" y="28" fill="var(--text-muted)" fontSize="8" fontWeight="700">{maxWeeklyCount}</text>
              <text x="5" y="63" fill="var(--text-muted)" fontSize="8" fontWeight="700">{Math.round(maxWeeklyCount / 2)}</text>
              <text x="5" y="98" fill="var(--text-muted)" fontSize="8" fontWeight="700">0</text>

              {/* Bars */}
              {weeklyCounts.map((count, idx) => {
                const barHeight = (count / maxWeeklyCount) * 70; // Max 70px height
                const x = 35 + idx * 50; // Bar spacing
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

              {/* X Axis Labels */}
              <text x="45" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">3w ago</text>
              <text x="95" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">2w ago</text>
              <text x="145" y="112" fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">1w ago</text>
              <text x="195" y="112" fill="var(--text-secondary)" fontSize="8" fontWeight="700" textAnchor="middle">This Wk</text>

              {/* Gradients */}
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

  const renderDemoSelector = () => (
    <div className="demo-state-selector">
      <span>Demo State:</span>
      <button className={`demo-btn ${demoState === 'normal' ? 'active' : ''}`} onClick={() => setDemoState('normal')}>Normal</button>
      <button className={`demo-btn ${demoState === 'loading' ? 'active' : ''}`} onClick={() => setDemoState('loading')}>Loading</button>
      <button className={`demo-btn ${demoState === 'empty' ? 'active' : ''}`} onClick={() => setDemoState('empty')}>Empty</button>
      <button className={`demo-btn ${demoState === 'error' ? 'active' : ''}`} onClick={() => setDemoState('error')}>Error</button>
    </div>
  );

  if (demoState === 'loading') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="skeleton-shimmer" style={{ width: '320px', height: '40px', marginBottom: '12px' }}></div>
          <div className="skeleton-shimmer" style={{ width: '450px', height: '20px' }}></div>
        </header>

        <section className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="stat-card skeleton-shimmer" style={{ height: '94px', border: 'none', background: 'rgba(255, 255, 255, 0.02)' }}></div>
          ))}
        </section>

        <section className="roles-section">
          <div className="skeleton-shimmer" style={{ width: '250px', height: '30px', marginBottom: '24px' }}></div>
          <div className="roles-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="role-card skeleton-shimmer" style={{ height: '280px', border: 'none', background: 'rgba(255, 255, 255, 0.02)' }}></div>
            ))}
          </div>
        </section>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'empty') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Interview Prep Dashboard</h1>
          <p>Track your analytical progress and launch simulated AI interview panels.</p>
        </header>
        
        <div className="state-container">
          <div className="state-icon-wrapper">📦</div>
          <h3>No Practice Domains Available</h3>
          <p>We couldn't retrieve any interview practice tracks right now. Please check back shortly or reload the list.</p>
          <button className="state-btn" onClick={() => setDemoState('normal')}>Load Categories</button>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Interview Prep Dashboard</h1>
          <p>Track your analytical progress and launch simulated AI interview panels.</p>
        </header>

        <div className="state-container error">
          <div className="state-icon-wrapper">⚠️</div>
          <h3>Dashboard Connection Failed</h3>
          <p>Unable to retrieve categories or analytics. This might be due to a mock backend response timeout or intermittent network status.</p>
          <div>
            <button className="state-btn" onClick={() => setDemoState('normal')}>Retry Loading</button>
            <button className="state-btn-secondary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-glow-orb dashboard-orb-1"></div>
      
      {/* Header section with Welcome text */}
      <header className="dashboard-header">
        <div className="header-badge">
          <span className="badge-icon"></span>
          <span>AI POWERED PLATFORM</span>
        </div>
        <h1>Interview Prep Dashboard</h1>
        <p>Track your analytical progress, review trends, and launch mock interviews.</p>
      </header>

      {/* Dynamic Analytics highlights */}
      <section className="stats-grid">
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
            <span className="stat-label">Average Rating Score</span>
            <span className="stat-value">{stats.avgScore > 0 ? `${stats.avgScore}/10` : '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-label">Total Practice Time</span>
            <span className="stat-value">{stats.totalPracticeTime} min{stats.totalPracticeTime !== 1 && 's'}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <span className="stat-label">Strongest Domain</span>
            <span className="stat-value" style={{ fontSize: '1.25rem', marginTop: '0.45rem' }}>{stats.strongestTopic}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📉</span>
          <div className="stat-info">
            <span className="stat-label">Weakest Domain</span>
            <span className="stat-value" style={{ fontSize: '1.25rem', marginTop: '0.45rem' }}>{stats.weakestTopic}</span>
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

      {/* Collapsible Analytics Section */}
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
      {renderDemoSelector()}
    </div>
  );
}

export default Dashboard;
