/**
 * Конфигурация полей формы регистрации.
 */
export const FORM_FIELDS = [
  { name: 'name', label: 'Имя', type: 'text', placeholder: 'Введите ваше имя' },
  {
    name: 'nickname',
    label: 'Никнейм',
    type: 'text',
    placeholder: '@username',
    half: true,
  },
  {
    name: 'age',
    label: 'Возраст',
    type: 'number',
    placeholder: '18',
    half: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: 'Минимум 6 символов',
  },
  {
    name: 'confirmPassword',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: 'Повторите пароль',
  },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
