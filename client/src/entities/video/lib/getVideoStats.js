import { formatFileSize, formatTime, formatViews } from '../../../shared/lib';

/**
 * Формирует массив статистики для отображения в VideoPlayer.
 *
 * @param {Object} video - данные видео
 * @returns {Array<Object>} - массив статистики
 */
export const getVideoStats = (video) => {
  if (!video) return [];

  const stats = [
    { icon: '📁', value: video.size ? formatFileSize(video.size) : null },
    { icon: '👁', value: formatViews(video.viewCount ?? 0) },
    { icon: '📅', value: formatTime(video.date || video.createdAt) },
    { icon: '💬', value: video.commentsCount ?? 0 },
    {
      icon: video.isLiked ? '❤️' : '🤍',
      value: video.likesCount ?? 0,
    },
  ];

  return stats.filter(
    (item) =>
      item.value !== undefined && item.value !== null && item.value !== ''
  );
};
