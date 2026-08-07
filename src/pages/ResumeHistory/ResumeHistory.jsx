import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  HardDrive,
  Trash2,
  Eye,
  Play,
  Sparkles,
  CheckCircle2,
  Clock,
  PlusCircle,
  X
} from 'lucide-react';
import { getResumesApi, deleteResumeApi, createInterview } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { formatFileSize } from '../../utils/fileValidation';
import { useToast } from '../../components/Toast/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import ResumePreview from '../../components/interview/ResumePreview';
import './ResumeHistory.css';

/**
 * ResumeHistory Component (PART D)
 * Displays a list of all uploaded candidate resumes, their extracted details,
 * cached interview questions, and actions (View Resume, Start Interview Again, Delete).
 */
function ResumeHistory() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected resume modal view state
  const [selectedResume, setSelectedResume] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Deletion state
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Launching state
  const [launchingId, setLaunchingId] = useState(null);

  const fetchResumeHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getResumesApi();
      const list = res?.resumes || res?.data?.resumes || [];
      setResumes(list);
    } catch (err) {
      console.error('Error fetching resume history:', err);
      setError(err.message || 'Failed to load resume history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const handleViewResume = (resume) => {
    setSelectedResume(resume);
    setViewModalOpen(true);
  };

  const handleStartInterviewAgain = async (resume) => {
    try {
      setLaunchingId(resume._id);
      addToast('Launching interview room with stored resume questions...', 'info');

      const extracted = resume.extractedData || {};
      const questionsList = resume.interviewQuestions || [];

      // Create session in database using stored cached questions (PART H - Performance Caching)
      const sessionTitle = extracted.name
        ? `${extracted.name} - Resume AI Session`
        : `${resume.originalFileName || 'Resume'} AI Interview`;

      let questionsPayload = [];
      if (Array.isArray(questionsList) && questionsList.length > 0) {
        questionsPayload = questionsList.map((q) => ({
          questionText: typeof q === 'string' ? q : q.question || 'Describe your technical experience.',
          userAnswer: '',
          score: null,
          feedback: '',
          strength: '',
          improvement: ''
        }));
      } else {
        questionsPayload = [
          { questionText: `Tell me about your background as described in ${resume.originalFileName}.`, userAnswer: '' },
          { questionText: 'Walk me through the key projects listed on your resume.', userAnswer: '' },
          { questionText: 'What technical challenges did you overcome in your recent role?', userAnswer: '' }
        ];
      }

      const createRes = await createInterview({
        title: sessionTitle,
        role: extracted.name ? `${extracted.name}'s Resume` : 'Resume Candidate',
        difficulty: 'medium',
        status: 'pending',
        questions: questionsPayload
      });

      const interviewId = createRes?.data?.interview?._id || createRes?.interview?._id || createRes?._id;

      if (!interviewId) {
        throw new Error('Could not initialize session.');
      }

      addToast('Interview room ready!', 'success');
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      console.error('Error launching interview session:', err);
      addToast(err.message || 'Failed to start interview session.', 'error');
    } finally {
      setLaunchingId(null);
    }
  };

  const confirmDeleteResume = (resume) => {
    setResumeToDelete(resume);
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;

    try {
      setIsDeleting(true);
      await deleteResumeApi(resumeToDelete._id);
      addToast('Resume deleted successfully.', 'success');
      setResumes((prev) => prev.filter((r) => r._id !== resumeToDelete._id));
      if (selectedResume?._id === resumeToDelete._id) {
        setViewModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      addToast(err.message || 'Failed to delete resume.', 'error');
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  return (
    <div className="resume-history-page max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="page-header flex justify-between items-end mb-8 border-b border-border pb-6">
        <div>
          <Badge variant="glow" size="md" icon={Sparkles} className="mb-2">
            CANDIDATE RESUME VAULT
          </Badge>
          <h1 className="text-3xl font-extrabold text-white">Resume History</h1>
          <p className="text-secondary text-sm mt-1 max-w-xl">
            Access your uploaded resumes, inspect extracted candidate profiles, and relaunch mock interview rooms with stored AI questions.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          leftIcon={PlusCircle}
          onClick={() => navigate('/interview-setup')}
        >
          Upload New Resume
        </Button>
      </div>

      {/* Loading Skeleton View */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="text-center p-8 max-w-md mx-auto">
          <p className="text-danger mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchResumeHistory}>
            Retry Loading
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && resumes.length === 0 && (
        <Card className="text-center p-12 max-w-lg mx-auto glass-card">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Resumes Uploaded Yet</h3>
          <p className="text-secondary text-sm mb-6">
            Upload your candidate CV or Resume to start personalized AI interviews tailored to your experience and skills.
          </p>
          <Button variant="glow" size="md" onClick={() => navigate('/interview-setup')}>
            Upload Resume Now
          </Button>
        </Card>
      )}

      {/* Resumes Grid List */}
      {!isLoading && !error && resumes.length > 0 && (
        <div className="resumes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const isDocx = resume.fileType === 'DOCX' || resume.originalFileName?.endsWith('.docx');
            const formattedSize = formatFileSize(resume.fileSize || 0);
            const dateStr = formatDate(resume.uploadDate || resume.createdAt);

            return (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="history-card glass-card flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Format Badge & Status */}
                  <div className="card-top flex items-center justify-between mb-4">
                    <div className={`format-icon-badge ${isDocx ? 'docx-style' : 'pdf-style'}`}>
                      <FileText size={20} />
                      <span className="badge-text">{isDocx ? 'DOCX' : 'PDF'}</span>
                    </div>

                    <span className="status-badge">
                      <CheckCircle2 size={12} className="text-emerald mr-1" />
                      {resume.status === 'completed'
                        ? 'Completed'
                        : resume.status === 'questions_generated'
                        ? 'Questions Ready'
                        : 'Extracted'}
                    </span>
                  </div>

                  {/* Resume Title */}
                  <h3 className="file-name-title font-bold text-white text-base mb-2 truncate" title={resume.originalFileName}>
                    {resume.originalFileName || 'Resume.pdf'}
                  </h3>

                  {/* Extracted Name if available */}
                  {resume.extractedData?.name && (
                    <p className="candidate-name text-purple text-xs font-semibold mb-3">
                      Candidate: {resume.extractedData.name}
                    </p>
                  )}

                  {/* File Metadata */}
                  <div className="meta-details text-secondary text-xs flex flex-col gap-1 mb-4">
                    <span className="flex items-center">
                      <Calendar size={13} className="mr-1 text-muted" /> {dateStr}
                    </span>
                    <span className="flex items-center">
                      <HardDrive size={13} className="mr-1 text-muted" /> {formattedSize}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="card-actions-bar border-t border-border pt-4 mt-2 flex items-center justify-between">
                  <div className="left-actions flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => handleViewResume(resume)}
                    >
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Play}
                      onClick={() => handleStartInterviewAgain(resume)}
                      disabled={launchingId === resume._id}
                    >
                      {launchingId === resume._id ? 'Launching...' : 'Start'}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-btn"
                    onClick={() => confirmDeleteResume(resume)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal View Extracted Resume Details */}
      {viewModalOpen && selectedResume && (
        <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="modal-content glass-card max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-purple" size={24} />
                {selectedResume.originalFileName}
              </h2>
              <span className="text-xs text-secondary">
                Uploaded on {formatDate(selectedResume.uploadDate || selectedResume.createdAt)}
              </span>
            </div>

            <ResumePreview
              resumeData={selectedResume.extractedData}
              onStartInterview={() => {
                setViewModalOpen(false);
                handleStartInterviewAgain(selectedResume);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(resumeToDelete)}
        title="Delete Resume Record?"
        message={`Are you sure you want to delete "${resumeToDelete?.originalFileName}"? This will permanently remove the record from MongoDB and delete the binary file from local storage.`}
        confirmText="Delete Resume"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteResume}
        onCancel={() => setResumeToDelete(null)}
      />
    </div>
  );
}

export default ResumeHistory;
