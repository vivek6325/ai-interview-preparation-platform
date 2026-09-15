import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './Landing.css';

/**
 * HeroSection Component
 * High-impact hero section with Vercel badge, gradient text, CTAs, and interactive UI preview mockup.
 */
export function HeroSection({ onStartPractice, onLogin }) {
  return (
    <section className="landing-hero-section">
      <div className="hero-bg-mesh"></div>

      <motion.div
        className="hero-content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Vercel Badge Pill */}
        <Badge variant="glow" size="md" icon={Sparkles} className="hero-top-badge mb-3">
          NEXT-GEN AI MOCK INTERVIEWER & CAREER COACH
        </Badge>

        {/* Large Headline */}
        <h1 className="hero-main-headline">
          Master Your Next Technical Interview with <span className="gradient-text-blue">PrepAI</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtext">
          Simulate real-time voice and text mock interviews customized to your target job profile. Get automated STAR-framework scorecards, detect skill weaknesses, and accelerate your candidate readiness.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-row">
          <Button variant="glow" size="lg" rightIcon={ArrowRight} onClick={onStartPractice}>
            Start Free Practice
          </Button>

          <Button variant="secondary" size="lg" leftIcon={PlayCircle} onClick={onLogin}>
            Login to Dashboard
          </Button>
        </div>

        {/* Social Proof Strip */}
        <div className="hero-proof-strip">
          <div className="proof-avatars">
            <span className="avatar-dot avatar-1"></span>
            <span className="avatar-dot avatar-2"></span>
            <span className="avatar-dot avatar-3"></span>
            <span className="avatar-dot avatar-4"></span>
          </div>

          <div className="proof-text">
            <div className="stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="star-icon fill-amber" />
              ))}
            </div>
            <span>Full-Stack <strong>MERN + Google Gemini AI</strong> Portfolio Showcase Project</span>
          </div>
        </div>

        {/* High-Fidelity UI Mockup Preview */}
        <motion.div
          className="hero-mockup-wrapper"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mockup-header-bar">
            <div className="mockup-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-url">https://prepai.io/interview-session/voice-room</span>
            <span className="mockup-status">🟢 AI Panel Active</span>
          </div>

          <div className="mockup-screen-content">
            <div className="mockup-split-preview">
              <div className="preview-left">
                <span className="preview-tag">React & System Architecture</span>
                <h4 className="preview-q">"Explain Virtual DOM reconciliation in React and how the key prop optimizes list rendering."</h4>
                <div className="preview-mic-ring">
                  <div className="mic-core">🎙️</div>
                </div>
                <div className="preview-wave">
                  <span className="wave-bar h-1"></span>
                  <span className="wave-bar h-2"></span>
                  <span className="wave-bar h-3"></span>
                  <span className="wave-bar h-2"></span>
                  <span className="wave-bar h-1"></span>
                </div>
              </div>

              <div className="preview-right">
                <div className="preview-card">
                  <span className="lbl">STAR Scorecard</span>
                  <span className="val text-emerald">9.2 / 10</span>
                </div>

                <div className="preview-card">
                  <span className="lbl">Skill Alignment</span>
                  <span className="val text-indigo">94% Match</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
