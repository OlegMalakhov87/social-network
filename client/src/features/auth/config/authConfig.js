/**
 * Поля формы регистрации.
 */
export const REGISTER_CONFIG = [
  {
    name: 'name',
    label: 'Имя',
    type: 'text',
    placeholder: 'Введите ваше имя',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: 'Минимум 6 символов',
    required: true,
  },
  {
    name: 'confirmPassword',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: 'Повторите пароль',
    required: true,
  },
];

/**
 * Поля формы входа.
 */
export const LOGIN_CONFIG = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: 'Минимум 6 символов',
    required: true,
  },
];

/**
 * Опции для выбора пола.
 */
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
