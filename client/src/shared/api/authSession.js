/** Тип экшена logout без импорта authSlice (избегаем циклических зависимостей). */
export const AUTH_LOGOUT_TYPE = 'auth/logout';

/**
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 */
export const dispatchAuthLogout = (store) => {
  store.dispatch({ type: AUTH_LOGOUT_TYPE });
};
