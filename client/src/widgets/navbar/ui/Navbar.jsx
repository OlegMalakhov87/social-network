import { NavLink } from 'react-router-dom';
import style from './Navbar.module.css';

/**
 * Массив элементов навигации.
 * @type {Array<{ path: string, label: string, icon: string }>}
 */
const navItems = [
  { path: '/profile', label: 'Профиль', icon: '👤' },
  { path: '/messages', label: 'Сообщения', icon: '💬' },
  { path: '/friends', label: 'Друзья', icon: '👥' },
  { path: '/news', label: 'Новости', icon: '📰' },
  { path: '/music', label: 'Музыка', icon: '🎵' },
  { path: '/videos', label: 'Видео', icon: '🎬' },
  { path: '/settings', label: 'Настройки', icon: '⚙️' },
];

/**
 * Боковая панель навигации.
 * @returns {React.ReactElement}
 */
export const Navbar = () => {
  return (
    <nav className={style.navbar} aria-label="Основная навигация">
      <ul className={style.navList}>
        {navItems.map((item) => (
          <li key={item.path} className={style.navItem}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${style.navLink} ${style.active}` : style.navLink
              }
              aria-current={undefined}
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
