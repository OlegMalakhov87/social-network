export {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAuth,
  registerUser,
} from './api/authApi'; // Выполняет запросы авторизации и регистрации.

export * from './lib/authSelectors'; // Возвращает срезы состояния авторизации.

export {
  default as authReducer,
  clearError,
  logout,
  sessionLogoutObserved,
  setAccessToken,
} from './model/authSlice'; // Хранит состояние авторизации и его действия.

export {
  changePassword,
  checkAuth,
  deleteUser,
  login,
  logoutSession,
  register,
  updateUser,
} from './model/authThunks'; // Выполняет запросы авторизации.

export {
  handleWebSocketSessionRevoked,
  refreshWebSocketAccess,
} from './model/refreshWebSocketAccess'; // Обновляет маркер доступа после истечения авторизации WebSocket.
