import { classNames, linkify } from '../../../lib';
import style from './Text.module.css';

/**
 * Универсальный текстовый компонент.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент текста
 * @param {'h1'|'h2'|'h3'|'h4'|'body1'|'body2'|'caption'|'inherit'} [props.variant='body1'] - типографический вариант
 * @param {boolean} [props.linkifyText=false] - преобразовывать ли URL в ссылки
 * @param {string} [props.className=''] - дополнительный CSS класс
 * @param {string} [props.as] - переопределение HTML-тега (по умолчанию зависит от variant)
 */
export const Text = ({
  children,
  variant = 'body1',
  linkifyText = false,
  className = '',
  as,
  ...rest
}) => {
  if (!children) return null;

  // Маппинг варианта на HTML-тег по умолчанию
  const tagMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    inherit: 'span',
  };

  const Component = as || tagMap[variant] || 'p';

  return (
    <Component
      className={classNames(style.text, style[variant], className)}
      {...rest}
    >
      {linkifyText ? linkify(children) : children}
    </Component>
  );
};
