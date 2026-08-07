import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Mic, Sparkles, TrendingUp } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import './Landing.css';

/**
 * HowItWorksSection Component
 * 4-step interactive timeline illustrating candidate practice flow.
 */
export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Configure Track or Upload Resume',
      description: 'Select your target job role (Frontend, Backend, Full Stack, DSA, HR) or upload a PDF resume for automated skill extraction.',
      icon: Sliders
    },
    {
      number: '02',
      title: 'Practice Real-Time Voice Loops',
      description: 'Join the AI Voice Panel. Questions are read aloud in real-time as your speech is recorded and transcribed live.',
      icon: Mic
    },
    {
      number: '03',
      title: 'Receive Itemized STAR Scorecards',
      description: 'Get instant AI feedback graded out of 10 with itemized strengths, weaknesses, and model answers aligned with the STAR framework.',
      icon: Sparkles
    },
    {
      number: '04',
      title: 'Track Skill Velocity & Practice Roadmap',
      description: 'Review your 6-axis skill radar analytics, weakness detection priorities, and follow your personalized 4-week practice roadmap.',
      icon: TrendingUp
    }
  ];

  return (
    <section className="landing-how-section" id="how-it-works">
      <div className="section-inner-container">
        <SectionHeader
          title="How PrepAI Transforms Your Interview Readiness"
          subtitle="Four simple steps to practice, evaluate, and master your technical interview loops."
          badgeText="WORKFLOW ROADMAP"
          badgeVariant="primary"
        />

        <div className="how-steps-timeline">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                className="step-timeline-item"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <div className="step-number-badge">{step.number}</div>
                <div className="step-card-box">
                  <div className="step-card-header">
                    <div className="step-icon-wrapper">
                      <Icon size={20} />
                    </div>
                    <h3 className="step-card-title">{step.title}</h3>
                  </div>
                  <p className="step-card-desc">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
