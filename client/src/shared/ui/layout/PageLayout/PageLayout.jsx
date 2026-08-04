import { classNames } from '../../../utils';
import styles from './PageLayout.module.css';

/**
 * Универсальный шаблон страницы.
 *
 * Используется всеми основными страницами приложения.
 *
 * @param {Object} props
 * @param {string} props.title - заголовок страницы
 * @param {string} [props.description] - описание страницы
 * @param {React.ReactNode} [props.actions] - действия над страницей (кнопки, формы, etc.)
 * @param {React.ReactNode} props.children - контент страницы
 * @param {boolean} [props.centered=false] - центрировать контент
 * @param {string} [props.className=''] - дополнительный CSS класс
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
