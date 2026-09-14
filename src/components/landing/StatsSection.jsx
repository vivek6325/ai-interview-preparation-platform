import { motion } from 'framer-motion';
import { Users, Award, ShieldCheck, Star } from 'lucide-react';
import './Landing.css';

/**
 * StatsSection Component
 * Counter stats strip showcasing platform metrics and social proof.
 */
export function StatsSection() {
  const stats = [
    { label: 'Mock Sessions Completed', value: '10,000+', icon: Users, accent: 'blue' },
    { label: 'Offer Success Rate', value: '94.8%', icon: Award, accent: 'emerald' },
    { label: 'Supported Tech Stacks', value: '500+', icon: ShieldCheck, accent: 'purple' },
    { label: 'Candidate Satisfaction Rating', value: '4.9 / 5', icon: Star, accent: 'amber' }
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
