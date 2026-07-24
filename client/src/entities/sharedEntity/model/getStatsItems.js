import { formatViews } from '../../../shared/lib';

/**
 * Получает массив элементов статистики для сущности.
 *
 * @param {Object} entity - нормализованная сущность
 * @returns {Array} - массив { icon, value }
 */
export const getStatsItems = (entity) => {
  if (!entity?.type) return [];

  const builder = STATS_MAP[entity.type];
  return builder ? builder(entity) : [];
};

/**
 * Базовая статистика для любой сущности.
 */
const LIKES_STATS = (entity) => [
  { icon: '❤️', value: formatViews(entity.stats?.likesCount ?? 0) },
];

const COMMENTS_STATS = (entity) => [
  { icon: '💬', value: formatViews(entity.stats?.commentsCount ?? 0) },
];

const VIEWS_STATS = (entity) => [
  { icon: '👁️', value: formatViews(entity.stats?.viewsCount ?? 0) },
];

const PLAYS_STATS = (entity) => [
  { icon: '▶', value: formatViews(entity.stats?.playsCount ?? 0) },
];

/**
 * Маппинг статистики для сущности.
 */
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
