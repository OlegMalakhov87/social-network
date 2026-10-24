export {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAuth,
  registerUser,
} from './api/authApi'; // API для работы с авторизацией и регистрацией

export * from './lib/authSelectors'; // selectors (селекторы для получения состояния авторизации)

export {
  default as authReducer,
  clearError,
  logout,
  sessionLogoutObserved,
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
