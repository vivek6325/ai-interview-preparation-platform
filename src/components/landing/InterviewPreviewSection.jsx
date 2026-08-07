import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, Sparkles, CheckCircle } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import './Landing.css';

/**
 * InterviewPreviewSection Component
 * Live interactive preview showcasing ChatGPT Voice + Google Warmup inspired voice room.
 */
export function InterviewPreviewSection() {
  return (
    <section className="landing-voice-preview-section" id="voice-preview">
      <div className="section-inner-container">
        <SectionHeader
          title="Interactive Voice Mock Room Experience"
          subtitle="Engineered to feel like a real technical interview panel with voice questions, mic recording, and live transcripts."
          badgeText="REAL-TIME VOICE ENGINE"
          badgeVariant="glow"
        />

        <motion.div
          className="voice-room-preview-card"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="voice-preview-question-card">
            <div className="q-tag-row">
              <span className="q-badge-track">Frontend Developer Track</span>
              <span className="q-badge-diff">Medium Difficulty</span>
            </div>
            <h3 className="q-text">"How does a Hash Map work under the hood in JavaScript, and how are bucket collisions handled?"</h3>
            <button type="button" className="btn-replay-preview">
              <Volume2 size={15} /> Replay Question Aloud
            </button>
          </div>

          <div className="voice-preview-mic-center">
            <div className="focal-mic-ring-aura">
              <div className="mic-aura-ring ring-1"></div>
              <div className="mic-aura-ring ring-2"></div>
              <button type="button" className="focal-mic-btn">
                <Mic size={32} />
              </button>
            </div>
            <span className="mic-status-text">🔴 Recording Speech Answer... Speak Now</span>
          </div>

          <div className="voice-preview-transcript-card">
            <div className="transcript-header-row">
              <span className="lbl">Live Speech Transcript</span>
              <span className="status-saved">✓ Auto-Saved</span>
            </div>
            <p className="transcript-content-text">
              "A Hash Map stores key-value pairs using a hash function that converts keys into integer array indices. Collisions occur when two distinct keys yield the same index, which can be resolved via separate chaining using linked lists or open addressing..."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default InterviewPreviewSection;
