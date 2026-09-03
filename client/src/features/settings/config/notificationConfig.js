/**
 * Конфигурация настроек уведомлений.
 *
 * @returns {Array<Object>} - массив настроек уведомлений
 */
export const NOTIFICATION_SETTINGS_CONFIG = [
  {
    key: 'email',
    label: 'Email уведомления',
    description: 'Получать уведомления на привязанную почту',
  },
  {
    key: 'push',
    label: 'Push уведомления',
    description: 'Показывать всплывающие окна в браузере',
  },
  {
    key: 'sound',
    label: 'Звук сообщений',
    description: 'Воспроизводить звук при новых сообщениях',
  },
  {
    key: 'friends',
    label: 'Запросы в друзья',
    description: 'Уведомлять о новых входящих заявках',
  },
  {
    key: 'posts',
    label: 'Новые посты',
    description: 'Уведомлять о публикациях друзей',
  },
  {
    key: 'digest',
    label: 'Дайджест новостей',
    description: 'Получать еженедельную подборку событий',
  },
];
