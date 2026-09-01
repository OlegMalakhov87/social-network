/**
 * Конфигурация полей формы редактирования профиля.
 *
 * @returns {Array<Object>} - массив полей формы
 */
export const PROFILE_SETTINGS_CONFIG = [
  {
    key: 'name',
    label: 'Имя',
    type: 'text',
    required: true,
    placeholder: 'Ваше имя',
    half: true,
  },
  {
    key: 'nickname',
    label: 'Никнейм',
    type: 'text',
    placeholder: '@username',
    half: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'email@example.com',
    half: true,
  },
  {
    key: 'phone',
    label: 'Телефон',
    type: 'tel',
    placeholder: '+7 (999) 999-99-99',
    half: true,
  },
  {
    key: 'birthDate',
    label: 'Дата рождения',
    type: 'date',
    placeholder: 'Выберите дату рождения',
    half: true,
  },
  {
    key: 'address',
    label: 'Город',
    type: 'text',
    placeholder: 'Ваш город',
    half: true,
  },
  {
    key: 'job',
    label: 'Работа',
    type: 'text',
    placeholder: 'Место работы',
    fullWidth: true,
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'text',
    placeholder: 'О себе',
    fullWidth: true,
    multiline: true,
    rows: 3,
  },
];
