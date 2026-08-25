/**
 * Поля формы регистрации.
 */
export const FORM_FIELDS = [
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
    name: 'age',
    label: 'Возраст',
    type: 'number',
    placeholder: 'Введите ваш возраст',
    half: true,
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
 * Опции для выбора пола.
 */
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
