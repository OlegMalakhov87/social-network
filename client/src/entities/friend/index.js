export * from './api/friendsApi'; // API - функции

export * from './lib/getEmptyState'; // Функция для получения заголовка и описания для пустой страницы друзей

export { getFriendDetails } from './lib/getFriendDetails'; // Функция для получения информации о друге
export { getFriendshipBadge } from './lib/getFriendshipBadge'; // Функция для получения конфигурации значка дружбы
export { getFriendshipButtonConfig } from './lib/getFriendshipButtonConfig'; // Функция для управления кнопками дружбы
export { normalizeFriend } from './lib/normalizeFriend'; // Функция для нормализации данных друга

export * from './model/friendsTab'; // Мапа для выбора вкладки друзей и категории друга

export { Friend } from './ui/Friend'; // Компонент для отображения карточки друга
