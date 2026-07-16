import { classNames } from '../../lib';
import styles from './PageLayout.module.css';

/**
 * Универсальный шаблон страницы.
 *
 * Используется всеми основными страницами приложения.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.actions]
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.centered=false] - Центрировать контент.
 * @param {string} [props.className=''] - Дополнительный CSS класс.
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
