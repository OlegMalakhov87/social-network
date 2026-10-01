import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, selectHasUser } from '../../../entities/auth';
import {
  Button,
  EntityHeader,
  IconButton,
  Image,
  SearchField,
} from '../../../shared/ui';
import { classNames } from '../../../shared/utils';
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

  /**
   * Обработчик изменения поискового запроса.
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  /**
   * Обработчик отправки поискового запроса.
   */
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      navigate('/friends');
      setSearchValue('');
    }
  };

  /**
   * Обработчик кнопки поиска.
   */
  const handleSearchAction = () => {
    if (!searchValue.trim()) return;
    navigate('/friends');
    setSearchValue('');
  };

  /**
   * Обработчик выхода из аккаунта.
   */
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={style.header}>
      <EntityHeader
        leftSlot={
          <div className={style.leftContent}>
            <NavLink
              to="/profile"
              aria-label="На главную"
              className={style.logoLink}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                fallback="/logo.png"
                className={style.logoImage}
              />
            </NavLink>

            <div className={style.searchContainer}>
              <SearchField
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                placeholder="Поиск пользователей..."
                aria-label="Поиск пользователей"
                rightIcon={
                  <IconButton
                    icon="➤"
                    size="md"
                    variant="ghost"
                    onClick={handleSearchAction}
                    ariaLabel="Найти пользователей"
                    className={style.searchAction}
                  />
                }
              />
            </div>
          </div>
        }
        rightSlot={
          isAuthenticated ? (
            <Button variant="primary" size="md" onClick={handleLogout}>
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
          )
        }
      />
    </header>
  );
};
