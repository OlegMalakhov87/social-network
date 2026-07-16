import { forwardRef } from 'react';
import { classNames } from '../../lib';
import { Card } from '../Card/Card';
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
 * @param {React.ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.actions]
 * @param {string} [props.className]
 */
export const SectionCard = forwardRef(
  ({ title, subtitle, actions, children, className }, ref) => {
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
