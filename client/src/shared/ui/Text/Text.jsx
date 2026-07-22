import { classNames, linkify } from '../../lib';
import style from './Text.module.css';

/**
 * Универсальный текст с возможностью линкинга ссылок.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент текста
 * @param {boolean} [props.linkifyText=false] - линкировать ли ссылки
 * @param {string} [props.className=''] - дополнительный CSS класс
 */
export const Text = ({ children, linkifyText = false, className = '' }) => {
  if (!children) return null;

  return (
    <div className={classNames(style.text, className)}>
      {linkifyText ? linkify(children) : children}
    </div>
  );
};
