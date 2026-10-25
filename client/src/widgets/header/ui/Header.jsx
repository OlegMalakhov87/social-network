import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import { logoutSession, selectHasUser } from '../../../entities/auth';
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
 * Отображает шапку приложения с логотипом, поиском и входом.
 *
 * @param {Object} props - Свойства компонента
 * @param {Function} [props.onSearchChange] - Обработчик изменения поискового запроса
 * @returns {JSX.Element} Разметка шапки.
 */
export const Header = ({ onSearchChange }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectHasUser);

  /**
   * Обновляет поисковый запрос и сообщает его родителю.
   *
   * @param {Object} e - Событие изменения поля
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  /**
   * Открывает поиск пользователей по нажатию Enter.
   *
   * @param {Object} e - Событие клавиатуры
   */
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      navigate('/friends');
      setSearchValue('');
    }
  };

  const handleSearchAction = () => {
    if (!searchValue.trim()) return;
    navigate('/friends');
    setSearchValue('');
  };

  const handleLogout = async () => {
    // Повторный выход не запускает, пока предыдущий запрос не завершён.
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await dispatch(logoutSession()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Ошибка выхода из аккаунта:', error);
    } finally {
      setIsLoggingOut(false);
    }
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
                src="/socialnet-1024.png"
                alt="Logo"
                fallback="/socialnet-180.png"
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
            <Button
              variant="primary"
              size="md"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Выход...' : 'Выйти'}
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
