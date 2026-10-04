import logoDark from '../../assets/logo/logo-horizontal-dark.png';
import logoLight from '../../assets/logo/logo-horizontal-light.png';
import logoIcon from '../../assets/logo/logo-icon.png';
import logoMono from '../../assets/logo/logo-monochrome.png';
import './Logo.css';

/**
 * Reusable Logo Component for STACKSCREEN
 * Renders Concept 4 official brand logo assets depending on UI background context.
 * 
 * Props:
 * @param {'horizontal' | 'dark' | 'light' | 'icon' | 'monochrome'} variant Logo variant (default: 'dark')
 * @param {number | string} height Custom image height (default: 32)
 * @param {string} className Additional CSS classes
 * @param {string} alt Alt text for accessibility (default: 'STACKSCREEN')
 * @param {boolean} iconOnly Force icon-only display
 */
export function Logo({
  variant = 'dark',
  height = 32,
  className = '',
  alt = 'STACKSCREEN',
  iconOnly = false,
  ...props
}) {
  let logoSrc = logoDark;
  let variantClass = 'logo-dark';

  if (iconOnly || variant === 'icon') {
    logoSrc = logoIcon;
    variantClass = 'logo-icon';
  } else if (variant === 'light') {
    logoSrc = logoLight;
    variantClass = 'logo-light';
  } else if (variant === 'monochrome') {
    logoSrc = logoMono;
    variantClass = 'logo-monochrome';
  } else if (variant === 'horizontal' || variant === 'dark') {
    logoSrc = logoDark;
    variantClass = 'logo-dark';
  }

  const heightVal = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`stackscreen-logo-wrapper ${variantClass} ${className}`} {...props}>
      <img
        src={logoSrc}
        alt={alt}
        className="stackscreen-logo-img"
        style={{ height: heightVal, width: 'auto', objectFit: 'contain' }}
        loading="eager"
      />
    </div>
  );
}

export default Logo;
