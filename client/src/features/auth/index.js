export * from './model/authSelectors'; // selectors (селекторы для получения состояния авторизации)
export * from './model/authSlice'; // slice (состояние авторизации)
export * from './model/authStorage'; // storage (функции для работы с JWT токеном (хранение и получение токена из localStorage))
export * from './model/authThunks'; // thunks (экшены для авторизации)
export { useRegisterForm } from './model/useRegisterForm'; // хук для управления формой регистрации

export { LoginForm } from './ui/LoginForm'; // форма для входа в систему
export { RegisterForm } from './ui/RegisterForm'; // форма для регистрации в системе
