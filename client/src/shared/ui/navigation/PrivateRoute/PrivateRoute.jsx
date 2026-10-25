import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { PageLoader } from '../../../ui';

/**
 * Показывает содержимое только вошедшему пользователю.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое маршрута
 * @param {string} [props.redirectTo='/login'] - Адрес перехода без входа
 * @returns {React.ReactNode} Содержимое, загрузка или переход на другой адрес.
 */
export const PrivateRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <PageLoader message={`Загружаем данные пользователя ${redirectTo}...`} />
    );
  }

  return children;
};
