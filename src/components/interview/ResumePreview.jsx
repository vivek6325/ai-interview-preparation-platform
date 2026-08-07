import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Code,
  Cpu,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Globe,
  Edit3,
  Play,
  Sparkles,
  Info
} from 'lucide-react';
import { useToast } from '../Toast/ToastContext';
import { Button } from '../ui/Button';
import { SkeletonText, SkeletonCard } from '../ui/Skeleton';
import './ResumePreview.css';

/**
 * ResumePreview Component (PART A)
 *
 * Displays structured candidate information in well-designed SaaS cards:
 * Personal Info, Summary, Skills, Technologies, Projects, Experience, Education, Certifications, Languages.
 * Includes loading skeletons, empty-state placeholders, an "Edit Later" placeholder button,
 * and a "Start Resume Interview" action button.
 *
 * @param {Object} props
 * @param {Object} [props.resumeData] - Structured resume JSON data
 * @param {boolean} [props.isLoading=false] - Loading state during AI extraction
 * @param {Function} props.onStartInterview - Trigger handler when candidate clicks "Start Resume Interview"
 * @param {boolean} [props.isGeneratingQuestions=false] - Loading state during question generation
 */
export function ResumePreview({
  resumeData,
  isLoading = false,
  onStartInterview,
  isGeneratingQuestions = false
}) {
  const { addToast } = useToast();

  const handleEditLaterClick = () => {
    addToast('Profile editing functionality will be available in the next release!', 'info');
  };

  if (isLoading) {
    return (
      <div className="resume-preview-container">
        <div className="preview-skeleton-wrapper">
          <div className="skeleton-header my-3">
            <SkeletonText width="40%" height="32px" />
            <SkeletonText width="60%" height="18px" className="mt-2" />
          </div>

          <div className="skeleton-grid">
            <SkeletonCard height="240px" />
            <SkeletonCard height="240px" />
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData) return null;

  const {
    name,
    email,
    phone,
    location,
    summary,
    skills = [],
    technologies = [],
    projects = [],
    experience = [],
    education = [],
    certifications = [],
    languages = []
  } = resumeData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="resume-preview-container"
    >
      <div className="preview-top-bar mb-4">
        <div>
          <span className="step-tag">AI RESUME EXTRACTED PROFILE</span>
          <h2 className="preview-page-title">Candidate Profile & Highlights</h2>
          <p className="preview-page-desc">
            Review your extracted background details below. These insights will be used by Gemini AI to craft your personalized interview room.
          </p>
        </div>

        <div className="preview-top-actions">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={Edit3}
            onClick={handleEditLaterClick}
          >
            Edit Later
          </Button>

          <Button
            type="button"
            variant="glow"
            size="md"
            rightIcon={Play}
            onClick={onStartInterview}
            disabled={isGeneratingQuestions}
          >
            {isGeneratingQuestions ? 'Generating Questions...' : 'Start Resume Interview'}
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Grid Layout */}
      <div className="preview-sections-grid">
        {/* Left Column: Personal Info, Summary, Experience, Projects */}
        <div className="grid-main-column">
          {/* Card 1: Personal Information */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <User className="card-icon text-purple" size={20} />
              <h3>Personal Information</h3>
            </div>

            <div className="personal-info-grid">
              <div className="info-tile">
                <span className="tile-label">Full Name</span>
                <span className="tile-value text-purple">{name || 'Not specified'}</span>
              </div>

              <div className="info-tile">
                <span className="tile-label">Email Address</span>
                <span className="tile-value flex-align">
                  <Mail size={13} className="mr-1 text-secondary" />
                  {email || 'Not specified'}
                </span>
              </div>

              <div className="info-tile">
                <span className="tile-label">Phone Number</span>
                <span className="tile-value flex-align">
                  <Phone size={13} className="mr-1 text-secondary" />
                  {phone || 'Not specified'}
                </span>
              </div>

              <div className="info-tile">
                <span className="tile-label">Location</span>
                <span className="tile-value flex-align">
                  <MapPin size={13} className="mr-1 text-secondary" />
                  {location || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Professional Summary */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <FileText className="card-icon text-blue" size={20} />
              <h3>Professional Summary</h3>
            </div>
            {summary ? (
              <p className="summary-text">{summary}</p>
            ) : (
              <div className="empty-section-placeholder">
                <Info size={16} className="mr-1 text-muted" />
                <span>No professional summary statement detected in resume.</span>
              </div>
            )}
          </div>

          {/* Card 3: Experience */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <Briefcase className="card-icon text-purple" size={20} />
              <h3>Work Experience</h3>
            </div>
            {experience && experience.length > 0 ? (
              <div className="experience-list">
                {experience.map((exp, idx) => (
                  <div key={idx} className="experience-item-card">
                    <div className="exp-item-top">
                      <div>
                        <h4 className="exp-role">{exp.role || 'Position Title'}</h4>
                        <span className="exp-company text-purple">{exp.company || 'Company'}</span>
                      </div>
                      {exp.duration && <span className="exp-duration">{exp.duration}</span>}
                    </div>
                    {exp.description && <p className="exp-desc">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <Info size={16} className="mr-1 text-muted" />
                <span>No work experience section found. Questions will emphasize projects and technical skills.</span>
              </div>
            )}
          </div>

          {/* Card 4: Software Projects */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <FolderGit2 className="card-icon text-emerald" size={20} />
              <h3>Key Software Projects</h3>
            </div>
            {projects && projects.length > 0 ? (
              <div className="projects-list">
                {projects.map((proj, idx) => (
                  <div key={idx} className="project-item-card">
                    <h4 className="proj-title">{proj.title || `Project #${idx + 1}`}</h4>
                    {proj.description && <p className="proj-desc">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="proj-tech-tags mt-2">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="tech-badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <Info size={16} className="mr-1 text-muted" />
                <span>No projects listed in resume.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Skills, Tech, Education, Certs, Languages */}
        <div className="grid-side-column">
          {/* Card 5: Core Skills */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <Code className="card-icon text-purple" size={18} />
              <h3>Core Skills</h3>
            </div>
            {skills && skills.length > 0 ? (
              <div className="pills-flex">
                {skills.map((skill, idx) => (
                  <span key={idx} className="skill-pill-item">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <span>No specific skills listed.</span>
              </div>
            )}
          </div>

          {/* Card 6: Technologies */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <Cpu className="card-icon text-blue" size={18} />
              <h3>Technologies & Tools</h3>
            </div>
            {technologies && technologies.length > 0 ? (
              <div className="pills-flex">
                {technologies.map((tech, idx) => (
                  <span key={idx} className="tech-pill-item">
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <span>No technology tools listed.</span>
              </div>
            )}
          </div>

          {/* Card 7: Education */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <GraduationCap className="card-icon text-emerald" size={18} />
              <h3>Education</h3>
            </div>
            {education && education.length > 0 ? (
              <div className="education-list">
                {education.map((edu, idx) => (
                  <div key={idx} className="edu-item">
                    <h4 className="edu-degree">{edu.degree || 'Degree'}</h4>
                    <span className="edu-inst">{edu.institution || 'University'}</span>
                    {edu.year && <span className="edu-year">{edu.year}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <span>No education section listed.</span>
              </div>
            )}
          </div>

          {/* Card 8: Certifications */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <Award className="card-icon text-warning" size={18} />
              <h3>Certifications</h3>
            </div>
            {certifications && certifications.length > 0 ? (
              <ul className="simple-list">
                {certifications.map((cert, idx) => (
                  <li key={idx}>
                    <Sparkles size={12} className="mr-1 text-warning" />
                    {cert}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-section-placeholder">
                <span>No certifications listed.</span>
              </div>
            )}
          </div>

          {/* Card 9: Languages */}
          <div className="preview-card glass-card">
            <div className="card-header">
              <Globe className="card-icon text-accent" size={18} />
              <h3>Languages</h3>
            </div>
            {languages && languages.length > 0 ? (
              <div className="pills-flex">
                {languages.map((lang, idx) => (
                  <span key={idx} className="lang-pill-item">
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-section-placeholder">
                <span>No spoken languages listed.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ResumePreview;
