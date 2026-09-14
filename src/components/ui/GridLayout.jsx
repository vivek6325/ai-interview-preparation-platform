import './GridLayout.css';

/**
 * Vercel Design System - 8-Point Grid Layout Components
 */
export function Container({ children, maxWidth = '1400px', className = '', ...props }) {
  return (
    <div className={`ds-container ${className}`} style={{ maxWidth }} {...props}>
      {children}
    </div>
  );
}

export function Grid({ children, cols = 12, gap = 4, className = '', ...props }) {
  return (
    <div className={`ds-grid ds-grid-cols-${cols} ds-gap-${gap} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Col({ children, span = 12, spanSm, spanMd, spanLg, className = '', ...props }) {
  const spanClasses = [
    `ds-col-${span}`,
    spanSm ? `ds-col-sm-${spanSm}` : '',
    spanMd ? `ds-col-md-${spanMd}` : '',
    spanLg ? `ds-col-lg-${spanLg}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`ds-col ${spanClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Container;
