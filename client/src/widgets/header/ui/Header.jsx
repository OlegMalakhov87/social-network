import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../../features/auth';
import { selectHasUser } from '../../../features/auth/model/authSelectors';
import { classNames } from '../../../shared/lib';
import { Button, Image, SearchField } from '../../../shared/ui';
import style from './Header.module.css';

/**
 * Шапка приложения с логотипом, навигацией и поиском.
 * @param {Object} props
 * @param {Function} props.onSearchChange - колбэк при изменении поискового запроса
 */
export const Header = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectHasUser);

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
        <NavLink to="/profile" aria-label="Главная страница">
          <Image
            src="/revivo-50.png"
            alt="Revivo Logo"
            fallback="/revivo-50.png"
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
          Главная
        </NavLink>
      </nav>

      <div className={style.search}>
        <SearchField
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          placeholder="Поиск пользователей..."
          aria-label="Поиск пользователей"
        />
      </div>

      <div className={style.auth}>
        {isAuthenticated ? (
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              classNames(
                style.navLink,
                style.authLink,
                isActive && style.active
              )
            }
          >
            Войти
          </NavLink>
        )}
      </div>
    </header>
  );
};
