export * from './api/userApi'; // Выполняет запросы пользователей.

export { getProfileFields } from './model/profileFields'; // Возвращает поля профиля.
export * from './model/userSchema'; // Описывает схемы пользователя.

export { getPhotosTabProps } from './lib/getPhotosTabProps'; // Возвращает свойства вкладки фото.
export { getPostsTabProps } from './lib/getPostsTabProps'; // Возвращает свойства вкладки постов.
export { getProfileActions } from './lib/getProfileActions'; // Возвращает действия профиля.
export { getTracksTabProps } from './lib/getTracksTabProps'; // Возвращает свойства вкладки треков.
export { getVideosTabProps } from './lib/getVideosTabProps'; // Возвращает свойства вкладки видео.

export { ProfileActions } from './ui/ProfileActions'; // Отображает действия профиля.
export { ProfileMeta } from './ui/ProfileMeta'; // Отображает сведения о пользователе.
