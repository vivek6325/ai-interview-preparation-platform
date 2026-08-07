import { useState, useCallback } from 'react';
import { validateResumeFile } from '../utils/fileValidation';

/**
 * Custom hook for managing resume file upload, drag & drop state, validation,
 * and loading placeholders (Upload Progress, Resume Parsing, AI Extraction).
 *
 * @returns {Object} Resume upload state and handler functions
 */
export function useResumeUpload() {
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Processing state placeholders for future API integration
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseStage, setParseStage] = useState('idle'); // 'idle' | 'uploading' | 'parsing' | 'extracting' | 'ready'
  const [extractedData, setExtractedData] = useState(null);

  /**
   * Process and validate a single raw File object.
   */
  const processFile = useCallback((selectedFile) => {
    if (!selectedFile) return false;

    const validation = validateResumeFile(selectedFile);

    if (!validation.isValid) {
      setError(validation.error);
      setFile(null);
      setFileDetails(null);
      setParseStage('idle');
      return false;
    }

    setError(null);
    setFile(selectedFile);
    setFileDetails(validation.fileDetails);
    setParseStage('idle');
    setUploadProgress(0);
    return true;
  }, []);

  /**
   * Remove selected file and reset states.
   */
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setFileDetails(null);
    setError(null);
    setIsDragging(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setParseStage('idle');
    setExtractedData(null);
  }, []);

  /**
   * File input change handler.
   */
  const handleFileChange = useCallback(
    (e) => {
      const files = e.target?.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  /**
   * Drag & drop event handlers.
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  /**
   * Simulated step-by-step processing placeholder for Upload, Parsing, and AI Extraction.
   * Ready for replacement with actual backend multipart upload & Gemini parsing.
   */
  const simulateProcessing = useCallback(async () => {
    if (!file) return false;

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Upload Progress Simulation
      setParseStage('uploading');
      for (let p = 10; p <= 100; p += 30) {
        setUploadProgress(p);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Step 2: Resume Parsing Placeholder
      setParseStage('parsing');
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: AI Extraction Placeholder
      setParseStage('extracting');
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Simulated Extracted Profile Data
      setExtractedData({
        detectedRole: 'Senior Software Engineer',
        topSkills: ['React', 'TypeScript', 'Node.js', 'System Design'],
        experienceYears: '4+',
        extractedProjectsCount: 3
      });

      setParseStage('ready');
      return true;
    } catch (err) {
      console.error('Error during simulated resume processing:', err);
      setError('An error occurred while processing the resume. Please try again.');
      setParseStage('idle');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  return {
    file,
    fileDetails,
    error,
    isDragging,
    isProcessing,
    uploadProgress,
    parseStage,
    extractedData,
    setError,
    processFile,
    handleFileChange,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    simulateProcessing
  };
}
