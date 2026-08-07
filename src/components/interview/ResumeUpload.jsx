import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, AlertCircle, FileCheck, Info } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, formatFileSize } from '../../utils/fileValidation';
import { Button } from '../ui/Button';
import './ResumeUpload.css';

/**
 * ResumeUpload Component
 *
 * Provides a drag-and-drop zone with file picker button, accepted formats & max size hints,
 * active drag highlights, and inline error validation messages.
 *
 * @param {Object} props
 * @param {Function} props.onFileChange - Handler for file input change
 * @param {Function} props.onDragOver - Drag over event handler
 * @param {Function} props.onDragLeave - Drag leave event handler
 * @param {Function} props.onDrop - Drop event handler
 * @param {boolean} [props.isDragging=false] - Whether drag-over is active
 * @param {string|null} [props.error=null] - Validation error message
 * @param {boolean} [props.disabled=false] - Disabled state
 */
export function ResumeUpload({
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging = false,
  error = null,
  disabled = false
}) {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="resume-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        className="sr-only-input"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        onChange={onFileChange}
        disabled={disabled}
        aria-label="Upload Resume PDF or DOCX file"
      />

      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.005 }}
        className={`upload-dropzone ${isDragging ? 'upload-dropzone--dragging' : ''} ${
          error ? 'upload-dropzone--error' : ''
        } ${disabled ? 'upload-dropzone--disabled' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleBrowseClick}
        role="region"
        aria-label="Resume Drop Zone"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
      >
        <div className="upload-dropzone-content">
          <motion.div
            animate={{
              y: isDragging ? -6 : 0,
              scale: isDragging ? 1.1 : 1
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`upload-icon-wrapper ${isDragging ? 'icon-dragging' : ''}`}
          >
            {isDragging ? (
              <FileUp size={36} className="text-purple" />
            ) : (
              <Upload size={36} className="text-primary" />
            )}
          </motion.div>

          <h3 className="upload-title">
            {isDragging ? 'Drop Your Resume Here' : 'Drag & Drop your Resume'}
          </h3>

          <p className="upload-subtitle">
            Or browse files from your computer to analyze your skills and work history.
          </p>

          <div className="upload-actions my-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={FileCheck}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse File
            </Button>
          </div>

          <div className="upload-constraints">
            <div className="constraint-item">
              <span className="constraint-label">Formats:</span>
              <span className="constraint-badge">PDF</span>
              <span className="constraint-badge">DOCX</span>
            </div>
            <div className="constraint-divider">•</div>
            <div className="constraint-item">
              <span className="constraint-label">Max Size:</span>
              <span className="constraint-value">{formatFileSize(MAX_FILE_SIZE_BYTES)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User-friendly Validation Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="upload-error-banner mt-3"
            role="alert"
          >
            <AlertCircle size={18} className="upload-error-icon" />
            <div className="upload-error-content">
              <strong>Upload Failed:</strong> {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResumeUpload;
