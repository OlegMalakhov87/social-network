/**
 * Получение заголовка для пустой страницы друзей.
 * @param {string} filter - фильтр друзей
 * @returns {string} - заголовок
 */
export const getEmptyTitle = (filter) => {
  switch (filter) {
    case 'friends':
      return 'У Вас пока нет друзей';
    case 'subscribers':
      return 'У Вас нет новых подписчиков';
    case 'subscriptions':
      return 'Вы ни на кого не подписаны';
    case 'friendsOfFriends':
      return 'Нет общих знакомых';
    default:
      return 'Пользователей не найдено';
  }
};

/**
 * Получение описания для пустой страницы друзей.
 * @param {string} filter - фильтр друзей
 * @returns {string} описание
 */
export const getEmptyDescription = (filter) => {
  switch (filter) {
    case 'friends':
      return 'Найдите интересных людей и добавьте их в друзья';
    case 'subscribers':
      return 'Заявки появятся после взаимодействия с другими пользователями';
    case 'subscriptions':
      return 'Найдите и подпишитесь на нового друга';
    case 'friendsOfFriends':
      return 'Когда у ваших друзей появятся общие знакомые, они отобразятся здесь';
    default:
      return 'Измените фильтр или попробуйте глобальный поиск';
  }
};
