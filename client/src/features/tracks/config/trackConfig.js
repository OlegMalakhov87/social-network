/**
 * Конфигурация полей формы добавления/редактирования видео.
 *
 * @returns {Array<Object>} - массив полей формы
 */
export const TRACK_CONFIG = [
  {
    key: 'title',
    label: 'Название',
    placeholder: 'Название трека',
    required: true,
    type: 'text',
  },
  {
    key: 'artist',
    label: 'Исполнитель',
    placeholder: 'Имя исполнителя или группы',
    required: true,
    type: 'text',
  },
  {
    key: 'album',
    label: 'Альбом',
    placeholder: 'Название альбома (необязательно)',
    required: false,
    type: 'text',
  },
  {
    key: 'description',
    label: 'Описание',
    type: 'text',
    placeholder: 'Введите описание трека (необязательно)',
    multiline: true,
    rows: 3,
  },
];
