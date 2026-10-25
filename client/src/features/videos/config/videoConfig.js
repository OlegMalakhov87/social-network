/**
 * Задаёт поля формы видео.
 */
export const VIDEO_CONFIG = [
  {
    key: 'title',
    label: 'Название',
    placeholder: 'Введите название видео',
    required: true,
    type: 'text',
  },
  {
    key: 'description',
    label: 'Описание',
    type: 'text',
    placeholder: 'Введите описание видео (необязательно)',
    multiline: true,
    rows: 3,
  },
];
