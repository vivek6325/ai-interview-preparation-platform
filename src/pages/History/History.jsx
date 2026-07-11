import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviews, deleteInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/helpers';
import './History.css';

function History() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getInterviews();
        const list = response?.data?.interviews || response || [];
        setInterviews(list);
      } catch (error) {
        console.error('Error fetching history:', error);
        addToast('Failed to load interview history.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [addToast]);

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setSelectedDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await deleteInterview(selectedDeleteId);
      addToast('Mock interview deleted successfully.', 'success');
      setInterviews(prev => prev.filter(item => item._id !== selectedDeleteId));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete interview.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const handleViewResults = (id) => {
    navigate(`/results?id=${id}`);
  };

  // Filter & Sort Logic
  const filteredInterviews = interviews
    .filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const topicMatch = categoryFilter === 'All' || 
                         item.title?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
                         (categoryFilter === 'DSA' && item.title?.toLowerCase().includes('algorithm'));

      const diffMatch = difficultyFilter === 'All' || 
                        item.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return titleMatch && topicMatch && diffMatch;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortOption === 'highest') {
        return (b.overallScore || 0) - (a.overallScore || 0);
      }
      if (sortOption === 'lowest') {
        return (a.overallScore || 0) - (b.overallScore || 0);
      }
      return 0;
    });

  // Calculate statistics
  const completedSessions = interviews.filter(i => i.status === 'completed');
  const totalCompleted = completedSessions.length;
  
  const averageScore = totalCompleted > 0
    ? parseFloat((completedSessions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalCompleted).toFixed(1))
    : 0;

  const successRate = totalCompleted > 0
    ? Math.round((completedSessions.filter(i => (i.overallScore || 0) >= 7).length / totalCompleted) * 100)
    : 0;

  if (loading) {
    return (
      <div className="history-page-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <h3>Retrieving Practice History...</h3>
          <p>Please stand by while we query the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-container">
      <div className="history-glow-orb history-orb-1"></div>
      
      <header className="history-header">
        <div className="header-badge">
          <span className="badge-icon"></span>
          <span>Records Vault</span>
        </div>
        <h1>Practice History</h1>
        <p>Review scores, STAR details, and track your performance trends.</p>
      </header>

      {/* Quick Stats Panel */}
      <section className="history-stats-row">
        <div className="history-stat-box">
          <span className="stat-box-title">Total Completed</span>
          <span className="stat-box-value">{totalCompleted} Mock Practice{totalCompleted !== 1 && 's'}</span>
          <span className="stat-box-trend text-green">🗣️ {interviews.filter(i => i.status === 'pending').length} sessions pending</span>
        </div>
        <div className="history-stat-box">
          <span className="stat-box-title">Average Score</span>
          <span className="stat-box-value">{averageScore} / 10</span>
          <span className="stat-box-trend text-blue">📈 Equivalent to {Math.round(averageScore * 10)}%</span>
        </div>
        <div className="history-stat-box">
          <span className="stat-box-title">Success Rate (Score &ge; 7)</span>
          <span className="stat-box-value">{successRate}%</span>
          <span className="stat-box-trend text-purple">⭐ Target Benchmark is 75%</span>
        </div>
      </section>

      {/* Search & Filters Toolbar */}
      <section className="history-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search roles or topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-wrapper">
          <div className="filter-group">
            <label>Topic</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Topics</option>
              <option value="DSA">DSA</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>
      </section>

      {/* History List Grid */}
      <section className="history-list-section">
        {filteredInterviews.length > 0 ? (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mock Practice Title</th>
                  <th>Practice Topic / Role</th>
                  <th>Difficulty</th>
                  <th>Completed On</th>
                  <th>Overall Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((item) => (
                  <tr key={item._id} className="history-row" onClick={() => item.status === 'completed' && handleViewResults(item._id)}>
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
                      <span className="history-item-date">{formatDate(item.createdAt)}</span>
                    </td>
                    <td>
                      <span className="history-item-score">
                        {item.status === 'completed' ? `${item.overallScore} / 10` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${item.status}`}>
                        {item.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="history-actions-cell" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'completed' ? (
                          <button className="btn-table-action view" onClick={() => handleViewResults(item._id)}>
                            View Report
                          </button>
                        ) : (
                          <button className="btn-table-action start" onClick={() => navigate('/interview', { state: { id: item._id } })}>
                            Start Mock
                          </button>
                        )}
                        <button className="btn-table-action delete" onClick={(e) => handleDeleteClick(item._id, e)} title="Delete Practice Session">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-container">
            <div className="state-icon-wrapper">📦</div>
            <h3>No Interviews Match Criteria</h3>
            <p>We couldn't find any historical sessions matching your selected filters. Try adjusting the dropdowns or search query.</p>
            <button className="state-btn" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('All');
              setDifficultyFilter('All');
              setSortOption('newest');
            }}>Reset Filters</button>
          </div>
        )}
      </section>

      {/* Custom Confirmation Dialog Modal Overlay */}
      <ConfirmationModal 
        isOpen={deleteModalOpen}
        title="Delete Interview Record?"
        message="Are you sure you want to permanently delete this practice record and all of its feedback metrics? This operation is destructive and cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default History;
