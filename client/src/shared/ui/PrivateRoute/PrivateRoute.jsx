import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '..';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <PageLoader message="Загружаем данные пользователя..." />;
  }

  return children;
};
