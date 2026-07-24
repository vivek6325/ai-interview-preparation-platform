import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound Component (404 Page)
 * Rendered when user navigates to an unmatched route.
 */
export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container py-5 text-center text-light min-vh-75 d-flex align-items-center justify-content-center">
      <div className="card bg-dark border border-secondary border-opacity-25 p-5 rounded-4 shadow-lg text-center" style={{ maxWidth: '500px' }}>
        <div className="display-1 fw-bold text-primary mb-2">404</div>
        <h1 className="h4 fw-bold text-light mb-3">Page Not Found</h1>
        <p className="text-secondary fs-7 mb-4">
          The requested page route does not exist or has been relocated.
        </p>

        <div className="d-flex justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
          <button
            type="button"
            className="btn btn-primary px-4 fw-bold"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
