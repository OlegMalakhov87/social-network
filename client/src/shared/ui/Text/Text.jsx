import { linkify } from '../../lib';
import style from './Text.module.css';

/**
 * Универсальный текст.
 */
export const Text = ({ children, linkifyText = false, className = '' }) => {
  if (!children) return null;

  return (
    <div className={`${style.text} ${className}`}>
      {linkifyText ? linkify(children) : children}
    </div>
  );
};
