export { normalizeSharedComment } from './lib/normalizeSharedComment'; // Нормализует объект комментария в объект SharedEntityCard.
export { normalizeSharedMessage } from './lib/normalizeSharedMessage'; // Нормализует объект сообщения в объект SharedEntityCard.
export { normalizeSharedNews } from './lib/normalizeSharedNews'; // Нормализует объект новости в объект SharedEntityCard.
export { normalizeSharedPhoto } from './lib/normalizeSharedPhoto'; // Нормализует объект фотографии в объект SharedEntityCard.
export { normalizeSharedPost } from './lib/normalizeSharedPost'; // Нормализует объект поста в объект SharedEntityCard.
export { normalizeSharedTrack } from './lib/normalizeSharedTrack'; // Нормализует объект трека в объект SharedEntityCard.
export { normalizeSharedVideo } from './lib/normalizeSharedVideo'; // Нормализует объект видео в объект SharedEntityCard.
export { isPlayable } from '../../shared/utils/isPlayable'; // Определяет, является ли сущность воспроизводимой (видео/аудио).
export { parseSharedEntity } from '../../shared/utils/parseSharedEntity'; // Парсит строку JSON в объект SharedEntity.

export { getStatsItems  } from './model/getStatsItems '; // Получает маппинг статистики для сущности.

export { SharedEntityCard } from './ui/SharedEntityCard'; // Компонент SharedEntityCard.
