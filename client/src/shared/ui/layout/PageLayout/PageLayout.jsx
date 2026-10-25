import { classNames } from '../../../utils';

import styles from './PageLayout.module.css';

/**
 * Отображает заголовок и содержимое страницы.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок страницы
 * @param {string} [props.description] - Описание страницы
 * @param {React.ReactNode} [props.actions] - Действия в заголовке страницы
 * @param {React.ReactNode} props.children - Содержимое страницы
 * @param {boolean} [props.centered=false] - Признак центрирования содержимого
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Разметка страницы.
 */
export const PageLayout = ({
  title,
  description,
  actions,
  children,
  centered = false,
  className = '',
}) => {
  return (
    <section className={classNames(styles.page, className)}>
      {(title || description || actions) && (
        <header className={styles.header}>
          <div className={styles.info}>
            <h1 className={styles.title}>{title}</h1>

            {description && <p className={styles.description}>{description}</p>}
          </div>

          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}

      <main className={styles.content}>{children}</main>
    </section>
  );
};
