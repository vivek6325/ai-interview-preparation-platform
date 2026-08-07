import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Vercel Design System - Button Component
 * Supports variants: primary, secondary, outline, ghost, danger, glow.
 * Sizes: sm, md, lg. Supports icon slots and isLoading state.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`ds-btn ds-btn-${variant} ds-btn-${size} ${isLoading ? 'ds-btn-loading' : ''} ${className}`}
      disabled={isButtonDisabled}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="ds-btn-spinner" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        LeftIcon && <LeftIcon className="ds-btn-icon-left" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}

      <span className="ds-btn-content">{children}</span>

      {!isLoading && RightIcon && (
        <RightIcon className="ds-btn-icon-right" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
    </button>
  );
}

export default Button;
