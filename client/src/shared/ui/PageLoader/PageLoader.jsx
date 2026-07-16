import { Loading } from '..';
import style from './PageLoader.module.css';

/**
 * Полноэкранный загрузчик страницы.
 *
 * Используется на уровне страниц и крупных разделов приложения.
 *
 * @param {Object} props
 * @param {string} props.message
 * @param {React.ReactNode} props.children
 */
export const PageLoader = ({ message = 'Загрузка...', children }) => {
  return (
    <section className={style.wrapper}>
      <Loading size="large" message={message} />

      {children && <div className={style.footer}>{children}</div>}
    </section>
  );
};
