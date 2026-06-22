import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from '../../ui';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Loading fullPage message="Загружаем данные пользователя..." />;
  }

  return children;
};
