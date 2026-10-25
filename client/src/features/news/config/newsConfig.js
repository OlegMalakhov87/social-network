/**
 * Задаёт поля формы новости.
 */
export const NEWS_CONFIG = [
  {
    key: 'title',
    label: 'Заголовок',
    required: true,
    placeholder: 'Введите заголовок новости',
    type: 'text',
  },
  {
    key: 'text',
    label: 'Текст новости',
    required: true,
    type: 'text',
    placeholder: 'Введите текст новости',
    multiline: true,
    rows: 3,
  },
  {
    key: 'source',
    label: 'Источник',
    required: true,
    placeholder: 'Название издания"',
    type: 'text',
  },
];
