export {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAuth,
  registerUser,
} from './api/authApi'; // API для работы с авторизацией и регистрацией

export { getAccessTokenClaims, isAccessTokenUsable } from './lib/accessToken'; // accessToken (функции для работы с JWT токеном (извлечение данных из токена, проверка срока действия токена))

export { createAuthRefreshCoordinator } from './lib/authRefreshCoordinator'; // authRefreshCoordinator (координатор для обмена сообщениями между вкладками)

export { AUTH_MESSAGE_TYPES } from './lib/authRefreshMessages'; // authRefreshMessages (типы сообщений для обмена сообщениями между вкладками)

export * from './lib/authSelectors'; // selectors (селекторы для получения состояния авторизации)

export {
  default as authReducer,
  clearError,
  logout,
  setAccessToken,
} from './model/authSlice'; // slice (состояние авторизации)

export {
  changePassword,
  checkAuth,
  deleteUser,
  login,
  logoutSession,
  register,
  updateUser,
} from './model/authThunks'; // thunks (экшены для авторизации)
