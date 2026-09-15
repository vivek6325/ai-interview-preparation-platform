import { motion } from 'framer-motion';
import { Users, Award, ShieldCheck, Star } from 'lucide-react';
import './Landing.css';

/**
 * StatsSection Component
 * Counter stats strip showcasing platform metrics and social proof.
 */
export function StatsSection() {
  const stats = [
    { label: 'Voice Speech Engine', value: 'Real-Time', icon: Users, accent: 'blue' },
    { label: 'STAR Evaluation Engine', value: '10-Point', icon: Award, accent: 'emerald' },
    { label: 'Skill Radar Analytics', value: '6-Axis', icon: ShieldCheck, accent: 'purple' },
    { label: 'PDF Resume Parser', value: 'Node 22 ESM', icon: Star, accent: 'amber' }
  ];

  return (
    <section className="landing-stats-section">
      <div className="stats-container">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              className={`stat-box stat-accent-${stat.accent}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="stat-icon-wrapper">
                <Icon size={22} />
              </div>
              <div className="stat-numbers">
                <span className="stat-val">{stat.value}</span>
                <span className="stat-lbl">{stat.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default StatsSection;
