import { formatViews } from '../../../shared/utils';

/**
 * Возвращает показатель лайков.
 *
 * @param {Object} entity - Общая сущность
 * @returns {Array<{ icon: string, value: string }>} Показатель лайков
 */
const LIKES_STATS = (entity) => [
  { icon: '❤️', value: formatViews(entity.stats?.likesCount ?? 0) },
];

/**
 * Возвращает показатель комментариев.
 *
 * @param {Object} entity - Общая сущность
 * @returns {Array<{ icon: string, value: string }>} Показатель комментариев
 */
const COMMENTS_STATS = (entity) => [
  { icon: '💬', value: formatViews(entity.stats?.commentsCount ?? 0) },
];

/**
 * Возвращает показатель просмотров.
 *
 * @param {Object} entity - Общая сущность
 * @returns {Array<{ icon: string, value: string }>} Показатель просмотров
 */
const VIEWS_STATS = (entity) => [
  { icon: '👁️', value: formatViews(entity.stats?.viewsCount ?? 0) },
];

/**
 * Возвращает показатель прослушиваний.
 *
 * @param {Object} entity - Общая сущность
 * @returns {Array<{ icon: string, value: string }>} Показатель прослушиваний
 */
const PLAYS_STATS = (entity) => [
  { icon: '▶', value: formatViews(entity.stats?.playsCount ?? 0) },
];

/** Хранит показатели по типу сущности. */
const STATS_MAP = {
  post: (entity) => [...LIKES_STATS(entity), ...COMMENTS_STATS(entity)],
  photo: (entity) => [...LIKES_STATS(entity), ...COMMENTS_STATS(entity)],
  track: (entity) => [
    ...LIKES_STATS(entity),
    ...COMMENTS_STATS(entity),
    ...PLAYS_STATS(entity),
  ],
  news: (entity) => [
    ...LIKES_STATS(entity),
    ...COMMENTS_STATS(entity),
    ...VIEWS_STATS(entity),
  ],
  video: (entity) => [
    ...LIKES_STATS(entity),
    ...COMMENTS_STATS(entity),
    ...VIEWS_STATS(entity),
  ],
  comment: (entity) => [...LIKES_STATS(entity)],
  message: (entity) => [...LIKES_STATS(entity)],
};

/**
 * Возвращает показатели статистики сущности.
 *
 * @param {Object} entity - Общая сущность
 * @returns {Array<{ icon: string, value: string }>} Показатели статистики
 */
export const getStatsItems = (entity) => {
  if (!entity?.type) return [];

  const builder = STATS_MAP[entity.type];
  return builder ? builder(entity) : [];
};
