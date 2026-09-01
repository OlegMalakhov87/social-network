/**
 * Конфигурация полей формы смены пароля.
 *
 * @returns {Array<Object>} - массив полей формы
 */
export const CHANGE_PASSWORD_SETTINGS_CONFIG = [
  {
    key: 'currentPassword',
    label: 'Текущий пароль',
    type: 'password',
    placeholder: 'Введите ваш текущий пароль',
    required: true,
  },
  {
    key: 'newPassword',
    label: 'Новый пароль',
    type: 'password',
    placeholder: 'Введите ваш новый пароль',
    required: true,
  },
  {
    key: 'confirmPassword',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: 'Подтвердите ваш новый пароль',
    required: true,
  },
];
