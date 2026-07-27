/**
 * Конфигурация полей формы редактирования профиля.
 *
 * @returns {Array<Object>} - массив полей формы
 */
export const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Имя',
    type: 'text',
    placeholder: 'Ваше имя',
    half: true,
  },
  {
    name: 'nickname',
    label: 'Никнейм',
    type: 'text',
    placeholder: '@username',
    half: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    half: true,
  },
  {
    name: 'phone',
    label: 'Телефон',
    type: 'tel',
    placeholder: '+7 (999) 999-99-99',
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
    name: 'address',
    label: 'Город',
    type: 'text',
    placeholder: 'Ваш город',
    half: true,
  },
  {
    name: 'job',
    label: 'Работа',
    type: 'text',
    placeholder: 'Место работы',
    fullWidth: true,
  },
  {
    name: 'status',
    label: 'Статус',
    type: 'text',
    placeholder: 'О себе',
    fullWidth: true,
  },
];
