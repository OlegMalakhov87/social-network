/**
 * Конфигурация настроек уведомлений.
 */
export const NOTIFICATION_SETTINGS_CONFIG = [
  {
    id: 'email',
    label: 'Email уведомления',
    description: 'Получать уведомления на привязанную почту',
  },
  {
    id: 'push',
    label: 'Push уведомления',
    description: 'Показывать всплывающие окна в браузере',
  },
  {
    id: 'sound',
    label: 'Звук сообщений',
    description: 'Воспроизводить звук при новых сообщениях',
  },
  {
    id: 'friends',
    label: 'Запросы в друзья',
    description: 'Уведомлять о новых входящих заявках',
  },
  {
    id: 'posts',
    label: 'Новые посты',
    description: 'Уведомлять о публикациях друзей',
  },
  {
    id: 'digest',
    label: 'Дайджест новостей',
    description: 'Получать еженедельную подборку событий',
  },
];
