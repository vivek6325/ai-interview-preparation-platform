/**
 * GlobalLoading Component
 * Displayed during Suspense code-splitting route transitions.
 */
export function GlobalLoading({ message = 'Loading module...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5 text-light">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary mt-3 fs-7 fw-semibold tracking-wider">{message}</p>
    </div>
  );
}

export default GlobalLoading;
