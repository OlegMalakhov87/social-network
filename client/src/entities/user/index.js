export * from './api/userApi'; // API для пользователей

export { getProfileFields } from './model/profileFields'; // Функция для отображения полей с данными пользователя на странице профиля
export { PROFILE_TABS_MAP } from './model/profileTabs'; // Мапа для получения пропсов для выбранной вкладки

export { getPhotosTabProps } from './lib/getPhotosTabProps'; // Функция для получения пропсов для вкладки "Фото"
export { getPostsTabProps } from './lib/getPostsTabProps'; // Функция для получения пропсов для вкладки "Посты"
export { getProfileActions } from './lib/getProfileActions'; // Функция для получения действий профиля
export { getProfileTabContent } from './lib/getProfileTabContent'; // Функция для получения контента выбранной вкладки
export { getTracksTabProps } from './lib/getTracksTabProps'; // Функция для получения пропсов для вкладки "Треки"
export { getVideosTabProps } from './lib/getVideosTabProps'; // Функция для получения пропсов для вкладки "Видео"
