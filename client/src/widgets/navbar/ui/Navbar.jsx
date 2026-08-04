import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '..';
import { classNames } from '../../../shared/utils';
import style from './Navbar.module.css';

/**
 * Боковая панель навигации(ссылки на основные разделы сайта).
 *
 * @returns {React.ReactNode}
 */
export const Navbar = () => {
  return (
    <nav className={style.navbar} aria-label="Основная навигация">
      <ul className={style.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.path} className={style.navItem}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                classNames(style.navLink, isActive && style.active)
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              <span className={style.navIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={style.navLabel}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
