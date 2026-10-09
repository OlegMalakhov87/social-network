import { forwardRef } from 'react';
import { classNames, linkifyText } from '../../../utils';
import style from './Text.module.css';

/**
 * Универсальный текстовый компонент.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент текста
 * @param {'h1'|'h2'|'h3'|'h4'|'body1'|'body2'|'caption'|'inherit'} [props.variant='body1'] - типографический вариант
 * @param {boolean} [props.linkify=false] - преобразовывать ли URL в ссылки
 * @param {string} [props.className=''] - дополнительный CSS класс
 * @param {string} [props.as] - переопределение HTML-тега (по умолчанию зависит от variant)
 * @returns {React.ReactNode} - компонент Text
 */
export const Text = forwardRef(
  (
    {
      children,
      variant = 'body1',
      linkify = false,
      className = '',
      as,
      ...rest
    },
    ref
  ) => {
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
        ref={ref}
        {...rest}
      >
        {linkify ? linkifyText(children) : children}
      </Component>
    );
  }
);
