import { Loading } from '../..';

import style from './PageLoader.module.css';

/**
 * Отображает загрузку страницы.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.message='Загрузка...'] - Текст загрузки
 * @param {React.ReactNode} [props.children=null] - Содержимое под индикатором
 * @returns {JSX.Element} Загрузка страницы.
 */
export const PageLoader = ({ message = 'Загрузка...', children = null }) => {
  return (
    <section className={style.wrapper}>
      <Loading size="large" message={message} />

      {children && <div className={style.footer}>{children}</div>}
    </section>
  );
};
