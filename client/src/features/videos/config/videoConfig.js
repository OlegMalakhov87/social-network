/**
 * Конфигурация полей формы добавления/редактирования видео.
 *
 * @returns {Array<Object>} - массив полей формы
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
    placeholder: 'Введите описание видео',
    multiline: true,
    rows: 3,
  },
];
