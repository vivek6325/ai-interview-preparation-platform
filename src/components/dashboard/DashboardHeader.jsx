import { Flame, Target, Download, Printer, Zap, Sparkles } from 'lucide-react';

/**
 * DashboardHeader Component
 * Premium hero header section with user greeting, streak/readiness pills, and quick action export buttons.
 */
export function DashboardHeader({
  userName = 'Candidate',
  streakDays = 5,
  readinessScore = 78,
  onStartSession,
  onExportCSV,
  onExportPDF,
  exporting = false
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="dashboard-hero-header">
      <div className="dashboard-hero-content">
        <div className="dashboard-hero-left">
          <div className="hero-badge-pill">
            <Sparkles className="icon-sparkle" size={14} />
            <span>AI CAREER COACH ENGINE</span>
          </div>

          <h1 className="hero-greeting">
            Welcome back, <span className="text-gradient">{userName}</span>
          </h1>

          <p className="hero-subtitle">
            {currentDate} • Here is your real-time interview readiness analytics & practice roadmap.
          </p>
        </div>

        <div className="dashboard-hero-right">
          {/* Quick Metrics Badges */}
          <div className="hero-badges-row">
            <div className="hero-pill-metric streak-pill" title="Active practice streak">
              <Flame size={16} className="text-amber" />
              <span>{streakDays} Day Streak</span>
            </div>

            <div className="hero-pill-metric readiness-pill" title="AI Readiness Score out of 100">
              <Target size={16} className="text-indigo" />
              <span>{readinessScore}/100 Readiness</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="hero-actions-row">
            {onStartSession && (
              <button type="button" className="btn-hero-action primary" onClick={onStartSession}>
                <Zap size={16} />
                <span>Start Practice</span>
              </button>
            )}

            <button
              type="button"
              className="btn-hero-action secondary"
              onClick={onExportCSV}
              disabled={exporting}
              title="Export CSV Analytics Report"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn-hero-action secondary"
              onClick={onExportPDF}
              title="Print PDF Scorecard Report"
            >
              <Printer size={15} />
              <span>PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
