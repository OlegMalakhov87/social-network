export * from './api/userApi'; // API для пользователей

export { getProfileFields } from './model/profileFields'; // Функция для отображения полей с данными пользователя на странице профиля

export { getPhotosTabProps } from './lib/getPhotosTabProps'; // Функция для получения пропсов для вкладки "Фото"
export { getPostsTabProps } from './lib/getPostsTabProps'; // Функция для получения пропсов для вкладки "Посты"
export { getProfileActions } from './lib/getProfileActions'; // Функция для получения действий профиля
export { getTracksTabProps } from './lib/getTracksTabProps'; // Функция для получения пропсов для вкладки "Треки"
export { getVideosTabProps } from './lib/getVideosTabProps'; // Функция для получения пропсов для вкладки "Видео"

export { ProfileActions } from './ui/ProfileActions'; // Компонент для отображения действий профиля
export { ProfileMeta } from './ui/ProfileMeta'; // Компонент для отображения метаданных пользователя
