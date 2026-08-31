/**
 * Поля формы регистрации.
 */
export const REGISTER_CONFIG = [
  {
    name: 'name',
    label: 'Имя *',
    type: 'text',
    placeholder: 'Введите ваше имя',
  },
  {
    name: 'email',
    label: 'Email *',
    type: 'email',
    placeholder: 'email@example.com',
  },
  {
    name: 'password',
    label: 'Пароль *',
    type: 'password',
    placeholder: 'Минимум 6 символов',
  },
  {
    name: 'confirmPassword',
    label: 'Подтвердите пароль *',
    type: 'password',
    placeholder: 'Повторите пароль',
  },
];

/**
 * Поля формы входа.
 */
export const LOGIN_CONFIG = [
  {
    name: 'email',
    label: 'Email *',
    type: 'email',
    placeholder: 'email@example.com',
  },
  {
    name: 'password',
    label: 'Пароль *',
    type: 'password',
    placeholder: 'Минимум 6 символов',
  },
];

/**
 * Опции для выбора пола.
 */
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
