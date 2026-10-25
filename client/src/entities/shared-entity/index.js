export { isPlayable } from '../../shared/utils/isPlayable'; // Проверяет, воспроизводится ли сущность.
export { parseSharedEntity } from '../../shared/utils/parseSharedEntity'; // Приводит строку JSON к объекту общей сущности.
export { normalizeSharedComment } from './lib/normalizeSharedComment'; // Приводит комментарий к карточке общей сущности.
export { normalizeSharedMessage } from './lib/normalizeSharedMessage'; // Приводит сообщение к карточке общей сущности.
export { normalizeSharedNews } from './lib/normalizeSharedNews'; // Приводит новость к карточке общей сущности.
export { normalizeSharedPhoto } from './lib/normalizeSharedPhoto'; // Приводит фотографию к карточке общей сущности.
export { normalizeSharedPost } from './lib/normalizeSharedPost'; // Приводит пост к карточке общей сущности.

export { getStatsItems } from './model/getStatsItems'; // Возвращает показатели статистики сущности.

export { SharedEntityCard } from './ui/SharedEntityCard'; // Отображает карточку общей сущности.
