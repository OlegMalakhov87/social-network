//export { default as usersReducer } from './model/usersSlice';

// API
export * from './api/userApi';

// Функция для отображения полей с данными пользователя на странице профиля
export { getProfileFields } from './model/profileFields';

// Мапа для получения пропсов для выбранной вкладки
export { PROFILE_TABS_MAP } from './model/profileTabs';

// Функции для получения пропсов для выбранной вкладки
export { getPhotosTabProps } from './lib/getPhotosTabProps';
export { getPostsTabProps } from './lib/getPostsTabProps';
export { getTracksTabProps } from './lib/getTracksTabProps';
export { getVideosTabProps } from './lib/getVideosTabProps';

// Функция для получения действий профиля
export { getProfileActions } from './lib/getProfileActions';

// Функция для получения контента выбранной вкладки
export { getProfileTabContent } from './lib/getProfileTabContent';
