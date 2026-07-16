/**
 * Базовые сообщения для уведомлений.
 * Используются для всех сущностей.
 */
export const MESSAGES = {
  success: {
    default: 'Операция выполнена успешно!',
    add: 'Успешно добавлено!',
    update: 'Успешно обновлено!',
    delete: 'Успешно удалено!',
    like: 'Лайк добавлен!',
    unlike: 'Лайк убран!',
    save: 'Сохранено!',
    publish: 'Опубликовано!',
    upload: 'Загружено!',
    send: 'Отправлено!',
    load: 'Данные загружены!',
  },

  error: {
    default: 'Произошла ошибка. Попробуйте позже.',
    network: 'Нет соединения с сервером. Проверьте интернет.',
    server: 'Ошибка на сервере. Попробуйте позже.',
    timeout: 'Превышено время ожидания. Попробуйте позже.',
    unauthorized: 'Недостаточно прав для выполнения операции.',
    notFound: 'Данные не найдены.',
    add: 'Не удалось добавить. Попробуйте позже.',
    update: 'Не удалось обновить. Попробуйте позже.',
    delete: 'Не удалось удалить. Попробуйте позже.',
    like: 'Не удалось обновить лайк. Попробуйте позже.',
    unlike: 'Не удалось убрать лайк. Попробуйте позже.',
    load: 'Не удалось загрузить данные. Попробуйте позже.',
    loadMore: 'Не удалось загрузить следующую страницу. Попробуйте позже.',
    save: 'Не удалось сохранить. Попробуйте позже.',
    publish: 'Не удалось опубликовать. Попробуйте позже.',
    upload: 'Не удалось загрузить файл. Проверьте формат и размер.',
    send: 'Не удалось отправить. Попробуйте позже.',
  },

  warning: {
    default: 'Внимание! Проверьте введённые данные.',
    empty: 'Поле не может быть пустым.',
    invalid: 'Неверный формат данных.',
    limit: 'Превышен лимит.',
    duplicate: 'Такая запись уже существует.',
    passwordMismatch: 'Пароли не совпадают.',
    passwordLength: 'Пароль должен быть не менее 6 символов.',
  },

  info: {
    default: 'Информация',
    loading: 'Загрузка...',
    empty: 'Данные не найдены',
    noMore: 'Все данные загружены',
    processing: 'Обработка...',
  },
};

/**
 * Маппинг сущностей: [название в винительном падеже, род]
 * Род: 'm' — мужской, 'f' — женский, 'n' — средний
 */
const ENTITY_MAP = {
  posts: { name: 'пост', gender: 'm' },
  news: { name: 'новость', gender: 'f' },
  comments: { name: 'комментарий', gender: 'm' },
  user: { name: 'пользователь', gender: 'm' },
  tracks: { name: 'трек', gender: 'm' },
  videos: { name: 'видео', gender: 'n' },
  photos: { name: 'фото', gender: 'n' },
  friends: { name: 'друг', gender: 'm' },
  messages: { name: 'сообщение', gender: 'n' },
};

/**
 * Возвращает название сущности в именительном падеже.
 * @param {string} entity - ключ сущности
 * @returns {string|null}
 */
export const getEntityName = (entity) => {
  return ENTITY_MAP[entity]?.name || null;
};

/**
 * Возвращает род сущности
 * @param {string} entity - ключ сущности
 * @returns {string} 'm', 'f' или 'n'
 */
export const getEntityGender = (entity) => {
  return ENTITY_MAP[entity]?.gender || 'm';
};

/**
 * Преобразует первую букву строки в заглавную.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
