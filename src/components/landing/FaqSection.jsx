import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import './Landing.css';

/**
 * FaqSection Component
 * Interactive accordion for candidate questions.
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does the AI Voice Mock Interviewer work?',
      a: 'PrepAI uses your browser SpeechSynthesis API to speak interview questions aloud and SpeechRecognition API to capture your voice answer in real-time. The transcribed speech is analyzed by Google Gemini AI to generate itemized STAR scorecards.'
    },
    {
      q: 'How does resume parsing tailor my questions?',
      a: 'Our ESM PDF parser reads uploaded candidate resumes on Node.js 22, extracting detected skills, technical stacks, and experience levels. Gemini then formulates customized questions specifically matching your resume profile.'
    },
    {
      q: 'What track categories are supported?',
      a: 'PrepAI supports Frontend (React, CSS, System Design), Backend (Node, Express, Databases), Full Stack, Data Structures & Algorithms (DSA), and HR Behavioral tracks.'
    },
    {
      q: 'Can I export my scorecard reports?',
      a: 'Yes! From your Practice History Vault or Dashboard, you can export your analytics in CSV format or generate print-ready PDF scorecard reports.'
    },
    {
      q: 'Is PrepAI free to use?',
      a: 'Yes, candidates can start with free mock sessions right away with zero credit card required.'
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="landing-faq-section" id="faq">
      <div className="section-inner-container">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about PrepAI voice mock interviews and AI analytics."
          badgeText="COMMON QUESTIONS"
          badgeVariant="primary"
        />

        <div className="faq-accordion-container">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card key={idx} className={`faq-item-card ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`faq-chevron ${isOpen ? 'chevron-rotated' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="faq-answer-wrapper"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="faq-answer-text">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
