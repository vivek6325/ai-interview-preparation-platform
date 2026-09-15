import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import './Landing.css';

/**
 * TestimonialsSection Component
 * Candidate feedback cards with ratings and company badges.
 */
export function TestimonialsSection() {
  const highlights = [
    {
      name: 'Real-Time Voice Speech Engine',
      role: 'Multimodal AI Integration',
      company: 'Web Speech API + Gemini STT',
      avatar: '🎙️',
      content: 'Integrates native browser SpeechRecognition and SpeechSynthesis APIs with Google Gemini AI audio transcription fallbacks to simulate realistic spoken mock interviews.'
    },
    {
      name: 'ESM PDF Resume Parser',
      role: 'Dynamic Question Synthesis',
      company: 'Node 22 Native ESM Engine',
      avatar: '📄',
      content: 'Parses candidate resumes to extract tech stacks, skills, and experience level, dynamically feeding contextual parameters into Gemini AI prompt generators.'
    },
    {
      name: '6-Axis Visual Analytics Vault',
      role: 'STAR Evaluation Engine',
      company: 'Express 5 + MongoDB Atlas',
      avatar: '📊',
      content: 'Computes itemized STAR scorecards out of 10, multi-dimensional skill radar charts, weakness detection engines, and structured 4-week practice roadmaps.'
    }
  ];

  return (
    <section className="landing-testimonials-section" id="testimonials">
      <div className="section-inner-container">
        <SectionHeader
          title="Full-Stack Technical Architecture Highlights"
          subtitle="Explore the key engineering components and AI capabilities powering the PrepAI candidate platform."
          badgeText="SYSTEM ARCHITECTURE"
          badgeVariant="success"
        />

        <div className="testimonials-grid">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              <Card className="testimonial-card">
                <p className="testimonial-quote">{item.content}</p>

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
