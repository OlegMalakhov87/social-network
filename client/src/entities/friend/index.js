export * from './api/friendsApi'; // Выполняет запросы друзей.

export * from './lib/getEmptyState'; // Возвращает заголовок и описание пустого списка друзей.
export { getFriendDetails } from './lib/getFriendDetails'; // Возвращает сведения о друге.
export {
  FRIENDSHIP_BADGE_VARIANT,
  getFriendshipBadge,
} from './lib/getFriendshipBadge'; // Возвращает значок дружбы и его варианты.
export { getFriendshipButtonConfig } from './lib/getFriendshipButtonConfig'; // Возвращает конфигурацию кнопки дружбы.
export { normalizeFriends } from './lib/normalizeFriends'; // Приводит друга к формату карточки.

export * from './model/friendsTab'; // Хранит категории друзей.

export { Friend } from './ui/Friend'; // Отображает карточку друга.
