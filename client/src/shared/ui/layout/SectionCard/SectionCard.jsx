import { forwardRef } from 'react';

import { Card } from '../../../ui';
import { classNames } from '../../../utils';

import style from './SectionCard.module.css';

/**
 * Отображает раздел страницы с заголовком и содержимым.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.title] - Заголовок раздела
 * @param {string} [props.subtitle] - Подзаголовок раздела
 * @param {React.ReactNode} [props.actions] - Действия в заголовке раздела
 * @param {React.ReactNode} props.children - Содержимое раздела
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {React.Ref<HTMLElement>} ref - Ссылка на карточку
 * @returns {JSX.Element} Раздел страницы.
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
