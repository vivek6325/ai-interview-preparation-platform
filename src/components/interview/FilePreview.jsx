import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, CheckCircle2, Loader2, Sparkles, Cpu, Layers } from 'lucide-react';
import { formatFileSize, getFileExtension } from '../../utils/fileValidation';
import { Button } from '../ui/Button';
import './FilePreview.css';

/**
 * FilePreview Component
 *
 * Displays selected resume details (File name, size, type format badge, remove action)
 * and interactive simulation placeholders for:
 * 1. Upload Progress Bar
 * 2. Resume Parsing status indicator
 * 3. AI Extraction placeholders
 *
 * @param {Object} props
 * @param {File} props.file - Raw browser File object
 * @param {Object} [props.fileDetails] - Pre-formatted file details ({ name, size, formattedSize, extension })
 * @param {Function} props.onRemove - Callback to remove/clear selected file
 * @param {boolean} [props.isProcessing=false] - Whether processing simulation is active
 * @param {number} [props.uploadProgress=0] - Upload progress percentage (0-100)
 * @param {string} [props.parseStage='idle'] - Current parsing stage ('idle' | 'uploading' | 'parsing' | 'extracting' | 'ready')
 * @param {Object} [props.extractedData=null] - Extracted profile placeholder data
 */
export function FilePreview({
  file,
  fileDetails,
  onRemove,
  isProcessing = false,
  uploadProgress = 0,
  parseStage = 'idle',
  extractedData = null
}) {
  if (!file && !fileDetails) return null;

  const fileName = fileDetails?.name || file?.name || 'Resume.pdf';
  const rawSize = fileDetails?.size || file?.size || 0;
  const formattedSize = fileDetails?.formattedSize || formatFileSize(rawSize);
  const extension = (fileDetails?.extension || getFileExtension(fileName).replace('.', '')).toUpperCase() || 'PDF';

  const isDocx = extension === 'DOCX';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="file-preview-card glass-card"
    >
      {/* File Info Bar */}
      <div className="file-info-header">
        <div className="file-info-left">
          <div className={`file-format-badge ${isDocx ? 'badge-docx' : 'badge-pdf'}`}>
            <FileText size={22} />
            <span className="format-type">{extension}</span>
          </div>

          <div className="file-meta">
            <h4 className="file-name" title={fileName}>
              {fileName}
            </h4>
            <span className="file-size">{formattedSize}</span>
          </div>
        </div>

        <div className="file-info-right">
          <span className="file-status-tag">
            <CheckCircle2 size={14} className="text-emerald" /> Valid File
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label="Remove attached file"
            className="remove-file-btn"
          >
            <Trash2 size={16} className="text-danger-hover" />
          </Button>
        </div>
      </div>

      {/* Placeholders for Future Backend Integration */}
      <div className="integration-placeholders-section">
        {/* Placeholder 1: Upload Progress Bar */}
        {(parseStage === 'uploading' || (isProcessing && uploadProgress > 0)) && (
          <div className="placeholder-box upload-progress-box">
            <div className="progress-label-row">
              <span className="progress-title">
                <Loader2 size={14} className="spin-icon text-primary" /> Uploading Resume...
              </span>
              <span className="progress-percentage">{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Placeholder 2: Resume Parsing Status Indicator */}
        {(parseStage === 'parsing' || parseStage === 'extracting') && (
          <div className="placeholder-box resume-parsing-box">
            <div className="parsing-status-header">
              <Cpu size={16} className="text-purple spin-pulse" />
              <span className="parsing-stage-text">
                {parseStage === 'parsing'
                  ? 'Parsing PDF structure & sections...'
                  : 'AI Extracting technical competencies...'}
              </span>
            </div>
            <div className="parsing-skeleton-bars">
              <div className="skeleton-bar bar-1" />
              <div className="skeleton-bar bar-2" />
            </div>
          </div>
        )}

        {/* Placeholder 3: AI Extraction Summary Card */}
        {parseStage === 'ready' && extractedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="placeholder-box ai-extraction-box"
          >
            <div className="extraction-header">
              <Sparkles size={16} className="text-emerald" />
              <span>AI Resume Analysis Ready</span>
            </div>

            <div className="extracted-chips-grid">
              <div className="chip-item">
                <span className="chip-label">Detected Role:</span>
                <span className="chip-val text-purple">{extractedData.detectedRole}</span>
              </div>
              <div className="chip-item">
                <span className="chip-label">Est. Experience:</span>
                <span className="chip-val text-blue">{extractedData.experienceYears}</span>
              </div>
            </div>

            <div className="extracted-skills-row mt-2">
              <span className="chip-label block mb-1">Extracted Key Skills:</span>
              <div className="skill-tags">
                {extractedData.topSkills.map((skill, i) => (
                  <span key={i} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Idle Informational Placeholder */}
        {parseStage === 'idle' && !isProcessing && (
          <div className="placeholder-idle-note">
            <Layers size={14} className="text-secondary" />
            <span>Ready for AI parsing. Click <strong>Generate AI Mock Session</strong> to extract topics.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default FilePreview;
