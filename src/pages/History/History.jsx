import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getHistoryAnalytics, exportAnalyticsReport } from '../../services/analyticsService';
import { deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/helpers';
import './History.css';

/**
 * History Page Component (Day 15 Upgrade)
 * Renders filtered, searchable, sorted, and paginated practice history,
 * with quick report previews and PDF/CSV export actions.
 */
function History() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [interviews, setInterviews] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Quick report modal state
  const [previewInterview, setPreviewInterview] = useState(null);

  // Extract filters from search parameters
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const difficultyFilter = searchParams.get('difficulty') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const dateFilter = searchParams.get('date') || 'All';
  const sortOption = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: searchTerm,
        role: categoryFilter !== 'All' ? categoryFilter : undefined,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
        status: statusFilter !== 'All' ? (statusFilter === 'Completed' ? 'completed' : 'pending') : undefined,
        sortBy: sortOption === 'highest' || sortOption === 'lowest' ? 'overallScore' : 'createdAt',
        order: sortOption === 'oldest' || sortOption === 'lowest' ? 'asc' : 'desc',
        page: currentPage,
        limit: 10
      };

      const response = await getHistoryAnalytics(params);
      const data = response?.data || response;
      setInterviews(data?.interviews || []);
      setPaginationMeta(data?.pagination || { page: 1, totalPages: 1, total: (data?.interviews || []).length });
    } catch (err) {
      console.error('Error fetching history analytics:', err);
      setError(err.message || 'Failed to retrieve your practice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [searchTerm, categoryFilter, difficultyFilter, statusFilter, dateFilter, sortOption, currentPage]);

  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
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
      fetchHistoryData();
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

  // Quick Statistics calculation
  const completedCount = useMemo(() => interviews.filter((i) => i.status === 'completed').length, [interviews]);
  const avgScore = useMemo(() => {
    const completed = interviews.filter((i) => i.status === 'completed' && i.overallScore !== null);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((a, b) => a + (b.overallScore > 10 ? b.overallScore : b.overallScore * 10), 0);
    return Math.round(sum / completed.length);
  }, [interviews]);

  return (
    <div className="history-page-container">
      <div className="history-glow-orb history-orb-1"></div>

      <header className="history-header d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <div className="header-badge mb-2">
            <span className="badge-icon">⚡</span>
            <span>RECORDS VAULT</span>
          </div>
          <h1 className="h2 fw-bold text-light mb-1">Practice History & Audit Log</h1>
          <p className="text-secondary mb-0">Search, filter, review transcripts, STAR feedback metrics, and export reports.</p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <span>📥</span> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 fw-bold"
            onClick={() => window.print()}
          >
            <span>📄</span> Print PDF
          </button>
        </div>
      </header>

      {/* Quick Stats Panel */}
      <section className="history-stats-row mb-4">
        <div className="history-stat-box">
          <span className="stat-box-title">Total Records</span>
          <span className="stat-box-value">{paginationMeta.total || interviews.length} Sessions</span>
          <span className="stat-box-trend text-green">🗣️ {completedCount} Completed on this page</span>
        </div>

        <div className="history-stat-box">
          <span className="stat-box-title">Average Page Score</span>
          <span className="stat-box-value">{avgScore}%</span>
          <span className="stat-box-trend text-blue">📈 Based on evaluated reports</span>
        </div>

        <div className="history-stat-box">
          <span className="stat-box-title">Filter Match Rate</span>
          <span className="stat-box-value">{interviews.length} Sessions</span>
          <span className="stat-box-trend text-purple">⭐ Page {currentPage} of {paginationMeta.totalPages || 1}</span>
        </div>
      </section>

      {/* Search & Multi-criteria Filters Toolbar */}
      <section className="history-toolbar mb-4">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search titles, roles, or topics..."
            value={searchTerm}
            onChange={(e) => updateSearchParam('search', e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-group">
            <label>Topic / Stack</label>
            <select value={categoryFilter} onChange={(e) => updateSearchParam('category', e.target.value)}>
              <option value="All">All Topics</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select value={difficultyFilter} onChange={(e) => updateSearchParam('difficulty', e.target.value)}>
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => updateSearchParam('status', e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">Pending</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortOption} onChange={(e) => updateSearchParam('sort', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>
      </section>

      {/* History List Table */}
      <section className="history-list-section">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Filtering interview records...</p>
          </div>
        ) : error ? (
          <div className="state-container error">
            <div className="state-icon-wrapper">⚠️</div>
            <h3>Failed to Load History</h3>
            <p>{error}</p>
            <button className="state-btn" onClick={fetchHistoryData}>Retry</button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="state-container text-center py-4">
            <div className="state-icon-wrapper">📦</div>
            <h3>No Interviews Match Filters</h3>
            <p>No practice records found matching your selected search parameters.</p>
            <button className="state-btn" onClick={handleResetFilters}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mock Practice Title</th>
                    <th>Role / Focus Stack</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Recorded Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((item) => (
                    <tr
                      key={item._id}
                      className="history-row"
                      onClick={() => item.status === 'completed' && navigate(`/results?id=${item._id}`)}
                    >
                      <td>
                        <span className="history-item-title">{item.title}</span>
                      </td>
                      <td>
                        <span className="history-item-role">{item.role}</span>
                      </td>
                      <td>
                        <span className={`difficulty-pill ${item.difficulty?.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag ${item.status}`}>
                          {item.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="history-item-score">
                          {item.status === 'completed' ? (
                            item.overallScore !== null && item.overallScore !== undefined ? (
                              item.overallScore <= 10 ? `${item.overallScore} / 10` : `${item.overallScore}%`
                            ) : '—'
                          ) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="history-item-date">{formatDate(item.createdAt)}</span>
                      </td>
                      <td>
                        <div className="history-actions-cell" onClick={(e) => e.stopPropagation()}>
                          {item.status === 'completed' ? (
                            <>
                              <button
                                className="btn-table-action view me-1"
                                onClick={() => setPreviewInterview(item)}
                                title="Quick Preview Report"
                              >
                                👁️ Quick View
                              </button>
                              <button
                                className="btn-table-action view"
                                onClick={() => navigate(`/results?id=${item._id}`)}
                              >
                                Full Report
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-table-action start"
                              onClick={() => navigate('/interview', { state: { id: item._id } })}
                            >
                              Continue
                            </button>
                          )}
                          <button
                            className="btn-table-action delete"
                            onClick={(e) => handleDeleteClick(item._id, e)}
                            title="Delete Session"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {paginationMeta.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="text-muted fs-7">
                  Showing Page {currentPage} of {paginationMeta.totalPages} ({paginationMeta.total} total sessions)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateSearchParam('page', (currentPage - 1).toString())}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage >= paginationMeta.totalPages}
                    onClick={() => updateSearchParam('page', (currentPage + 1).toString())}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick Report Preview Modal */}
      {previewInterview && (
        <div className="modal-backdrop-custom show d-flex align-items-center justify-content-center" role="dialog">
          <div className="modal-card-custom bg-dark text-light p-4 rounded-4 shadow-lg border border-secondary" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0 fw-bold">📊 Quick Report: {previewInterview.title}</h3>
              <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewInterview(null)}></button>
            </div>

            <div className="mb-3">
              <div className="d-flex gap-3 align-items-center mb-2">
                <span className="badge bg-primary fs-7">Role: {previewInterview.role}</span>
                <span className="badge bg-success fs-7">
                  Score: {previewInterview.overallScore <= 10 ? `${previewInterview.overallScore} / 10` : `${previewInterview.overallScore}%`}
                </span>
                <span className="text-muted fs-8">{formatDate(previewInterview.createdAt)}</span>
              </div>
              <p className="fs-7 text-secondary">
                {previewInterview.overallFeedback || 'No summary feedback available.'}
              </p>
            </div>

            {previewInterview.questions && previewInterview.questions.length > 0 && (
              <div className="mb-3">
                <h5 className="fs-7 fw-bold text-info">Questions Addressed:</h5>
                <ol className="ps-3 fs-8 text-light">
                  {previewInterview.questions.slice(0, 3).map((q, idx) => (
                    <li key={idx} className="mb-1">{q.questionText}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewInterview(null)}>Close</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/results?id=${previewInterview._id}`)}>
                Open Full Report →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Practice Record?"
        message="Are you sure you want to permanently delete this practice record? This operation is destructive."
        confirmText="Yes, Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default History;
