import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../app/providers/slices/authSlice';
import { SearchField, Button } from '../../../shared/ui';
import { classNames } from '../../../shared/lib';
import style from './Header.module.css';
import { ImageWithFallback } from '../../../shared/hooks';

/**
 * Шапка приложения с логотипом, навигацией и поиском.
 * @param {Object} props
 * @param {Function} props.onSearchChange - колбэк при изменении поискового запроса
 */
export const Header = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      navigate('/friends');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();

    navigate('/login');
  };

  return (
    <header className={style.header}>
      <div className={style.logo}>
        <NavLink to="/profile">
          <ImageWithFallback
            src="/revivo-50.png"
            fallback="/revivo-50.png"
            alt="Revivo"
            loading="lazy"
            decoding="async"
            className={style.logoImage}
          />
        </NavLink>
      </div>

      <nav className={style.nav}>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            classNames(style.navLink, isActive && style.active)
          }
        >
          Главная страница
        </NavLink>
      </nav>

      <div className={style.search}>
        <SearchField
          type="search"
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          placeholder="Поиск пользователей..."
          aria-label="Поиск пользователей"
        />
      </div>

      <div className={style.auth}>
        {isAuthenticated ? (
          <Button variant="secondary" onClick={handleLogout}>
            Выйти
          </Button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              classNames(style.navLink, isActive && style.active)
            }
          >
            Войти
          </NavLink>
        )}
      </div>
    </header>
  );
};
