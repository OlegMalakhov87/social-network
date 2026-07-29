import { forwardRef } from 'react';
import { classNames } from '../../../lib';
import { Card } from '../../Card/Card';
import style from './SectionCard.module.css';

/**
 * Универсальная секция страницы.
 *
 * Используется для разделов:
 * - Посты
 * - Фото
 * - Видео
 * - Музыка
 * - Друзья
 * - Настройки
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент секции
 * @param {string} [props.title] - заголовок секции
 * @param {string} [props.subtitle] - подзаголовок секции
 * @param {React.ReactNode} [props.actions] - действия над секцией (кнопки, формы, etc.)
 * @param {string} [props.className=''] - дополнительный CSS класс
 */
export const SectionCard = forwardRef(
  ({ title, subtitle, actions, children, className = '' }, ref) => {
    return (
      <Card ref={ref} className={classNames(style.section, className)}>
        {(title || subtitle || actions) && (
          <header className={style.header}>
            <div className={style.info}>
              {title && <h2 className={style.title}>{title}</h2>}

              {subtitle && <p className={style.subtitle}>{subtitle}</p>}
            </div>

            {actions && <div className={style.actions}>{actions}</div>}
          </header>
        )}

        <div className={style.content}>{children}</div>
      </Card>
    );
  }
);
