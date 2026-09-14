import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';
import './Landing.css';

/**
 * DashboardPreviewSection Component
 * Large high-fidelity mockup displaying executive SaaS dashboard analytics.
 */
export function DashboardPreviewSection() {
  return (
    <section className="landing-dashboard-preview-section" id="dashboard-preview">
      <div className="section-inner-container">
        <SectionHeader
          title="Executive Career & Practice Intelligence"
          subtitle="Explore our Vercel-inspired SaaS analytics layout packed with 6-axis skill radar charts and readiness metrics."
          badgeText="SaaS ANALYTICS DASHBOARD"
          badgeVariant="purple"
        />

        <motion.div
          className="dashboard-mockup-frame"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mockup-nav-header">
            <div className="mockup-nav-left">
              <span className="brand-dot-nav"></span>
              <span className="nav-title">PrepAI Executive Analytics</span>
            </div>
            <div className="mockup-nav-right">
              <span className="nav-badge-pill">🔥 5 Day Streak</span>
              <span className="nav-badge-pill">🎯 78/100 Readiness</span>
            </div>
          </div>

          <div className="mockup-grid-layout">
            <div className="mockup-card stat-preview-1">
              <span className="lbl">Overall Score</span>
              <span className="val text-indigo">88.5%</span>
              <span className="trend text-emerald">+12.4% vs last week</span>
            </div>

            <div className="mockup-card stat-preview-2">
              <span className="lbl">Highest Score</span>
              <span className="val text-emerald">96%</span>
              <span className="trend">Peak Performance</span>
            </div>

            <div className="mockup-card stat-preview-3">
              <span className="lbl">Learning Velocity</span>
              <span className="val text-amber">High Pacing</span>
              <span className="trend text-sky">4 Sessions this week</span>
            </div>

            <div className="mockup-card main-chart-preview">
              <div className="chart-preview-header">
                <h5>6-Axis Skill Radar Evaluation</h5>
              </div>
              <div className="radar-mock-visual">
                <div className="radar-polygon-layer"></div>
                <div className="radar-axis-label label-top">Technical</div>
                <div className="radar-axis-label label-right">Problem Solving</div>
                <div className="radar-axis-label label-bottom">Confidence</div>
                <div className="radar-axis-label label-left">Communication</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default DashboardPreviewSection;
