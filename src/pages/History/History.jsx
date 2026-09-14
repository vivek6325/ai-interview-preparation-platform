import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Trash2, Eye, Calendar, Sparkles, Download, Printer } from 'lucide-react';
import { getHistoryAnalytics, exportAnalyticsReport } from '../../services/analyticsService';
import { deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/helpers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TextInput, Select } from '../../components/ui/Input';
import './History.css';

/**
 * History Page Component (Flagship SaaS Vault Redesign)
 * Searchable timeline cards view with quick preview modals and report exports.
 */
function History() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Quick report modal state
  const [previewInterview, setPreviewInterview] = useState(null);

  // Extract filters from search parameters
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const difficultyFilter = searchParams.get('difficulty') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const sortOption = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchTerm,
          role: categoryFilter !== 'All' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
          status: statusFilter !== 'All' ? (statusFilter === 'Completed' ? 'completed' : 'pending') : undefined,
          sortBy: sortOption === 'highest' || sortOption === 'lowest' ? 'overallScore' : 'createdAt',
          order: sortOption === 'oldest' || sortOption === 'lowest' ? 'asc' : 'desc',
          page: currentPage,
          limit: 9
        };

        const response = await getHistoryAnalytics(params);
        const data = response?.data || response;
        if (isSubscribed) {
          setInterviews(data?.interviews || []);
        }
      } catch (err) {
        console.error('Error fetching history analytics:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchHistoryData();
    return () => {
      isSubscribed = false;
    };
  }, [searchTerm, categoryFilter, difficultyFilter, statusFilter, sortOption, currentPage]);

  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setSelectedDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await deleteInterview(selectedDeleteId);
      addToast('Mock interview record deleted successfully.', 'success');
      setInterviews(prev => prev.filter(item => item._id !== selectedDeleteId));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete interview record.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      addToast('Downloading CSV history report...', 'info');
      await exportAnalyticsReport('csv');
      addToast('CSV export complete!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="history-page-container">
      <div className="history-glow-orb purple-orb"></div>

      <header className="history-header d-flex justify-content-between align-items-end mb-4">
        <div>
          <Badge variant="glow" size="md" icon={Sparkles} className="mb-2">
            PRACTICE HISTORY VAULT
          </Badge>
          <h1 className="history-title">Mock Sessions & Audit Log</h1>
          <p className="history-subtitle">
            Search, filter, review transcripts, STAR scorecards, and export candidate performance reports.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleExportCSV}
            isLoading={exporting}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Printer}
            onClick={() => window.print()}
          >
            Print PDF
          </Button>
        </div>
      </header>

      {/* Toolbar & Filter Controls */}
      <section className="history-toolbar-card mb-4">
        <div className="toolbar-grid">
          <TextInput
            placeholder="Search titles, roles, or topics..."
            value={searchTerm}
            onChange={(e) => updateSearchParam('search', e.target.value)}
            icon={Search}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => updateSearchParam('category', e.target.value)}
          >
            <option value="All">All Stacks</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
          </Select>

          <Select
            value={difficultyFilter}
            onChange={(e) => updateSearchParam('difficulty', e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </Select>

          <Select
            value={sortOption}
            onChange={(e) => updateSearchParam('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </Select>
        </div>
      </section>

      {/* Cards Timeline Grid */}
      <section className="history-cards-grid">
        {loading ? (
          <div className="text-center py-5 col-span-3">
            <p className="text-secondary">Loading records vault...</p>
          </div>
        ) : interviews.length === 0 ? (
          <Card className="text-center py-5 col-span-3">
            <h3>No Records Found</h3>
            <p className="text-secondary mb-3">No sessions matched your selected filter terms.</p>
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </Card>
        ) : (
          interviews.map((item) => (
            <Card
              key={item._id}
              className="history-item-card"
              onClick={() => item.status === 'completed' && navigate(`/results?id=${item._id}`)}
            >
              <div className="card-top-row">
                <span className="item-role-tag">{item.role} Track</span>
                <Badge
                  variant={item.status === 'completed' ? 'success' : 'warning'}
                  size="sm"
                >
                  {item.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </div>

              <h3 className="item-card-title">{item.title}</h3>

              <div className="card-score-row">
                <div className={`score-badge-circle ${item.status === 'completed' ? 'completed' : 'pending'}`}>
                  <span className="score-val">
                    {item.status === 'completed' && item.overallScore !== null
                      ? item.overallScore <= 10
                        ? `${item.overallScore}/10`
                        : `${item.overallScore}%`
                      : '—'}
                  </span>
                </div>

                <div className="item-meta">
                  <span className="item-date">
                    <Calendar size={13} /> {formatDate(item.createdAt)}
                  </span>
                  <span className="item-diff">{item.difficulty} Difficulty</span>
                </div>
              </div>

              <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                {item.status === 'completed' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => setPreviewInterview(item)}
                    >
                      Quick View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/results?id=${item._id}`)}
                    >
                      Full Report →
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={() => navigate(`/interview/${item._id}`)}
                  >
                    Continue →
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteClick(item._id, e)}
                  title="Delete Session"
                >
                  <Trash2 size={15} className="text-danger" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* Quick Report Preview Modal */}
      {previewInterview && (
        <div className="modal-backdrop-custom show flex-center">
          <Card className="modal-preview-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 fw-bold m-0">📊 Report: {previewInterview.title}</h3>
              <button className="btn-close-white" onClick={() => setPreviewInterview(null)}>✕</button>
            </div>

            <p className="fs-7 text-secondary">
              {previewInterview.overallFeedback || 'No feedback summary generated.'}
            </p>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setPreviewInterview(null)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => navigate(`/results?id=${previewInterview._id}`)}>
                Open Full Report →
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Practice Record?"
        message="Are you sure you want to permanently delete this practice record?"
        confirmText="Yes, Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default History;
