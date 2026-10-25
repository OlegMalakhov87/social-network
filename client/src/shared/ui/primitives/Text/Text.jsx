import { forwardRef } from 'react';

import { classNames, linkifyText } from '../../../utils';

import style from './Text.module.css';

/**
 * Отображает текст выбранного вида.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое текста
 * @param {'h1'|'h2'|'h3'|'h4'|'body1'|'body2'|'caption'|'inherit'} [props.variant='body1'] - Вариант оформления
 * @param {boolean} [props.linkify=false] - Преобразование адресов URL в ссылки
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {string} [props.as] - HTML-тег вместо варианта оформления
 * @param {React.Ref} ref - Ссылка на элемент
 * @returns {JSX.Element|null} Текст или пустой результат без содержимого.
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

    // Сопоставляет вариант оформления с HTML-тегом.
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
