import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../app/providers/slices/authSlice';
import { SearchInput } from '../../../shared/ui';
import style from './Header.module.css';

/**
 * Шапка приложения с логотипом, навигацией и поиском.
 * @param {Object} props
 * @param {Function} props.onSearchChange - колбэк при изменении поискового запроса
 */
export const Header = ({ onSearchChange }) => {
  const [searchQuery, setSearchQueryLocal] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQueryLocal(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      e.preventDefault();
      navigate('/friends');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={style.header}>
      <div className={style.logo}>
        <NavLink to="/profile">
          <img src="/revivo-50.png" alt="Logo" className={style.logoImage} />
        </NavLink>
      </div>

      <nav className={style.nav}>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? `${style.navLink} ${style.active}` : style.navLink
          }
        >
          Главная страница
        </NavLink>
      </nav>

      <div className={style.search}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          placeholder="Поиск пользователей..."
        />
      </div>

      <div className={style.auth}>
        {isAuthenticated ? (
          <button onClick={handleLogout} className={style.authLink}>
            Выйти
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? `${style.authLink} ${style.active}` : style.authLink
            }
          >
            Войти
          </NavLink>
        )}
      </div>
    </header>
  );
};
