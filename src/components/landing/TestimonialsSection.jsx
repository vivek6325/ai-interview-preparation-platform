import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import './Landing.css';

/**
 * TestimonialsSection Component
 * Candidate feedback cards with ratings and company badges.
 */
export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Full Stack Engineer',
      company: 'Secured Offer at Meta',
      avatar: '👨‍💻',
      content: 'PrepAI voice mock interviews were a game changer for my senior interview loop. The real-time speech feedback and STAR scorecard gave me exact clarity on what to improve.'
    },
    {
      name: 'Priya Sharma',
      role: 'Frontend Developer',
      company: 'Secured Offer at Google',
      avatar: '👩‍💻',
      content: 'The ESM PDF resume parser tailored mock questions directly to my React and TypeScript project experience. The 6-axis skill radar highlighted my exact strengths.'
    },
    {
      name: 'Marcus Vance',
      role: 'Backend Engineer',
      company: 'Secured Offer at Amazon',
      avatar: '👨‍💼',
      content: 'I practiced 12 mock voice sessions over 2 weeks. Following the 4-week practice roadmap helped me land my dream Senior Backend offer with complete confidence!'
    }
  ];

  return (
    <section className="landing-testimonials-section" id="testimonials">
      <div className="section-inner-container">
        <SectionHeader
          title="Loved by Candidates Who Landed Top Tech Offers"
          subtitle="See how software engineers use PrepAI to practice voice interviews and land dream offers."
          badgeText="CANDIDATE TESTIMONIALS"
          badgeVariant="success"
        />

        <div className="testimonials-grid">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              <Card className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="star-fill-amber" />
                  ))}
                </div>

                <p className="testimonial-quote">"{item.content}"</p>

                <div className="testimonial-author-row">
                  <span className="author-avatar">{item.avatar}</span>
                  <div className="author-info">
                    <h4 className="author-name">{item.name}</h4>
                    <span className="author-role">{item.role}</span>
                    <span className="author-company">{item.company}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
