export * from './api/authApi'; // API для работы с авторизацией и регистрацией

export * from './lib/authSelectors'; // selectors (селекторы для получения состояния авторизации)
export * from './lib/authStorage'; // storage (функции для работы с JWT токеном (хранение и получение токена из localStorage))

export { default as authReducer, clearError, logout } from './model/authSlice'; // slice (состояние авторизации)
export * from './model/authThunks'; // thunks (экшены для авторизации)
