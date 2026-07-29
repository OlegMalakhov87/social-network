import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '..';

/**
 * Приватный маршрут.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент маршрута
 * @param {string} props.redirectTo - URL, на который перенаправлять при неаутентификации
 */
export const PrivateRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!user) {
    return <PageLoader message={`Загружаем данные пользователя ${redirectTo}...`} />;
  }

  return children;
};
