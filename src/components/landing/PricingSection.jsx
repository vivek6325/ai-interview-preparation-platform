import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import './Landing.css';

/**
 * PricingSection Component
 * 3 pricing tier cards with feature checklist tags and CTA buttons.
 */
export function PricingSection({ onStartPractice }) {
  const plans = [
    {
      title: 'Free Practice',
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring AI mock interviews and basic text practice.',
      features: [
        '3 Mock Interview Sessions / month',
        'Text & Voice Practice Modes',
        'Basic STAR Scorecards',
        'General Question Tracks'
      ],
      cta: 'Start Free Practice',
      variant: 'secondary',
      popular: false
    },
    {
      title: 'Pro Candidate',
      price: '$19',
      period: 'per month',
      description: 'Unlocks full AI Voice Panel, ESM PDF Resume Parser, and 6-Axis Analytics.',
      features: [
        'Unlimited AI Mock Interviews',
        'Full Web Speech STT & TTS Voice Engine',
        'ESM PDF Resume Customization',
        '6-Axis Skill Radar & Score Timelines',
        'Weakness Detection & 4-Week Practice Plan',
        'CSV & PDF Scorecard Exports'
      ],
      cta: 'Get Pro Access',
      variant: 'glow',
      popular: true
    },
    {
      title: 'Enterprise Team',
      price: '$49',
      period: 'per seat / mo',
      description: 'Built for bootcamps, hiring teams, and career placement services.',
      features: [
        'Everything in Pro Candidate',
        'Team Dashboard & Candidate Vault',
        'Custom Company Role Tracks',
        'Dedicated API Access',
        'Priority Support'
      ],
      cta: 'Contact Sales',
      variant: 'outline',
      popular: false
    }
  ];

  return (
    <section className="landing-pricing-section" id="pricing">
      <div className="section-inner-container">
        <SectionHeader
          title="Simple, Transparent Pricing for Every Candidate"
          subtitle="Choose the plan that fits your interview preparation timeline. Upgrade or cancel anytime."
          badgeText="PRICING PLANS"
          badgeVariant="purple"
        />

        <div className="pricing-cards-grid">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              <Card className={`pricing-card ${plan.popular ? 'popular-card' : ''}`}>
                {plan.popular && (
                  <span className="popular-badge">
                    <Sparkles size={12} /> MOST POPULAR
                  </span>
                )}

                <h3 className="pricing-title">{plan.title}</h3>
                <p className="pricing-desc">{plan.description}</p>

                <div className="pricing-amount-row">
                  <span className="amount">{plan.price}</span>
                  <span className="period">/ {plan.period}</span>
                </div>

                <ul className="pricing-features-list">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <Check size={16} className="text-emerald" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="md"
                  onClick={onStartPractice}
                  className="pricing-cta-btn"
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
