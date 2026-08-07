import React from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, Award, Radar, AlertTriangle, Calendar } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import './Landing.css';

/**
 * FeaturesSection Component
 * Grid of 6 Vercel-style feature cards with icons, subtitles, and ambient glow on hover.
 */
export function FeaturesSection() {
  const features = [
    {
      title: 'Real-Time Voice AI Interviewer',
      description: 'Practice interactive speech sessions with browser-native speech recognition and speech synthesis. Questions are spoken aloud in real-time.',
      icon: Mic,
      tag: 'Voice Engine',
      accent: 'blue'
    },
    {
      title: 'ESM PDF Resume Parser',
      description: 'Upload candidate resumes to extract tech stacks, years of experience, and skills dynamically to tailor question difficulty.',
      icon: FileText,
      tag: 'Resume AI',
      accent: 'purple'
    },
    {
      title: 'STAR Scorecard Reports',
      description: 'Receive itemized evaluations graded out of 10 aligned with the STAR framework (Situation, Task, Action, Result).',
      icon: Award,
      tag: 'AI Evaluation',
      accent: 'emerald'
    },
    {
      title: '6-Axis Skill Radar Analytics',
      description: 'Visualize candidate capabilities across Communication, Technical Knowledge, Problem Solving, Confidence, Behavioral, and Coding.',
      icon: Radar,
      tag: 'Visual Analytics',
      accent: 'amber'
    },
    {
      title: 'Weakness Detection Engine',
      description: 'Automatically detects top 5 weaknesses, repeated feedback patterns, and urgency levels to focus candidate review.',
      icon: AlertTriangle,
      tag: 'Weakness AI',
      accent: 'red'
    },
    {
      title: '4-Week Practice Roadmap',
      description: 'Generates structured 4-week practice roadmaps with daily and weekly target goals tailored to target job profiles.',
      icon: Calendar,
      tag: 'Career Roadmap',
      accent: 'blue'
    }
  ];

  return (
    <section className="landing-features-section" id="features">
      <div className="section-inner-container">
        <SectionHeader
          title="Everything You Need to Ace Your Technical Interviews"
          subtitle="Enterprise AI tools built to train software engineers, developers, and candidate job seekers."
          badgeText="CORE PLATFORM FEATURES"
          badgeVariant="glow"
        />

        <div className="features-cards-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className={`feature-card feature-border-${feat.accent}`}>
                  <div className="feature-card-top">
                    <div className={`feature-icon-badge icon-glow-${feat.accent}`}>
                      <Icon size={22} />
                    </div>
                    <span className="feature-tag">{feat.tag}</span>
                  </div>

                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
