import { Globe, Share2, Code2, Heart } from 'lucide-react';
import './Landing.css';

/**
 * FooterSection Component
 * Footer with brand links, tech stack badges, and social media icons.
 */
export function FooterSection() {
  return (
    <footer className="landing-footer-section">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <span className="footer-logo">
              PrepAI<span className="dot">.</span>
            </span>
            <p className="footer-brand-desc">
              Next-generation AI Mock Interview & Career Analytics Platform. Empowering software engineers to master behavioral and technical loops.
            </p>
            <div className="footer-social-links">
              <a href="https://github.com/vivek6325" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Code2 size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Globe size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Share">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Platform</h5>
            <ul className="footer-links">
              <li><a href="#features">Voice Interviewer</a></li>
              <li><a href="#dashboard-preview">SaaS Analytics</a></li>
              <li><a href="#how-it-works">Practice Roadmap</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Practice Tracks</h5>
            <ul className="footer-links">
              <li><a href="/dashboard">Frontend Development</a></li>
              <li><a href="/dashboard">Backend Development</a></li>
              <li><a href="/dashboard">Full Stack Engineering</a></li>
              <li><a href="/dashboard">Data Structures & Algorithms</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Built With</h5>
            <div className="footer-stack-tags">
              <span className="stack-badge">Node.js 22</span>
              <span className="stack-badge">React 19</span>
              <span className="stack-badge">Google Gemini AI</span>
              <span className="stack-badge">MongoDB Atlas</span>
              <span className="stack-badge">Vite</span>
              <span className="stack-badge">Web Speech API</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <span className="copyright-text">
            © {new Date().getFullYear()} PrepAI Inc. Built with <Heart size={13} className="text-red" /> for software engineers worldwide.
          </span>
          <span className="privacy-text">Privacy Policy • Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
