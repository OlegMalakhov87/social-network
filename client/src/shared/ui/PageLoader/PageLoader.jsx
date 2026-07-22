import { Loading } from '..';
import style from './PageLoader.module.css';

/**
 * Полноэкранный загрузчик страницы.
 *
 * Используется на уровне страниц и крупных разделов приложения.
 *
 * @param {Object} props
 * @param {string} props.message - текст загрузки
 * @param {React.ReactNode} [props.children] - контент ниже загрузчика
 */
export const PageLoader = ({ message = 'Загрузка...', children = null }) => {
  return (
    <section className={style.wrapper}>
      <Loading size="large" message={message} />

      {children && <div className={style.footer}>{children}</div>}
    </section>
  );
};
