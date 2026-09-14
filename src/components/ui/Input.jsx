import { Search } from 'lucide-react';
import './Input.css';

/**
 * Vercel Design System - TextInput Component
 */
export function TextInput({
  label,
  helperText,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ds-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ds-input-label">
          {label}
        </label>
      )}

      <div className="ds-input-field-wrapper">
        {Icon && <Icon className="ds-input-icon-left" size={16} />}
        <input
          id={inputId}
          className={`ds-input ${Icon ? 'has-left-icon' : ''} ${error ? 'is-error' : ''}`}
          {...props}
        />
      </div>

      {error ? (
        <span className="ds-input-error-text">{error}</span>
      ) : (
        helperText && <span className="ds-input-helper-text">{helperText}</span>
      )}
    </div>
  );
}

/**
 * Vercel Design System - Select Component
 */
export function Select({
  label,
  options = [],
  helperText,
  error,
  className = '',
  id,
  children,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ds-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ds-input-label">
          {label}
        </label>
      )}

      <select id={inputId} className={`ds-select ${error ? 'is-error' : ''}`} {...props}>
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>

      {error ? (
        <span className="ds-input-error-text">{error}</span>
      ) : (
        helperText && <span className="ds-input-helper-text">{helperText}</span>
      )}
    </div>
  );
}

/**
 * Vercel Design System - Textarea Component
 */
export function Textarea({
  label,
  helperText,
  error,
  rows = 4,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ds-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ds-input-label">
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        rows={rows}
        className={`ds-textarea ${error ? 'is-error' : ''}`}
        {...props}
      />

      {error ? (
        <span className="ds-input-error-text">{error}</span>
      ) : (
        helperText && <span className="ds-input-helper-text">{helperText}</span>
      )}
    </div>
  );
}

/**
 * Vercel Design System - SearchInput Component
 */
export function SearchInput({ placeholder = 'Search...', ...props }) {
  return <TextInput icon={Search} placeholder={placeholder} type="text" {...props} />;
}

export default TextInput;
