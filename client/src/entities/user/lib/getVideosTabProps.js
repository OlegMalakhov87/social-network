/**
 * Возвращает пропсы для вкладки "Видео".
 *
 * @param {Object} ctx - контекст компонента
 * @returns {Object} - пропсы для вкладки "Видео"
 */

export const getVideosTabProps = (ctx) => ({
  videos: ctx.items,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isOwnProfile: ctx.isOwnProfile,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  mode: ctx.mode,
  toggleLikes: ctx.toggleLikes,
  addOptimistic: ctx.addOptimistic,
  removeOptimistic: ctx.removeOptimistic,
  updateViewCount: ctx.updateViewCount,
  onPlayVideo: ctx.onPlayVideo,
  deleteVideo: ctx.deleteVideo,
  toggleComments: ctx.toggleComments,
  toggleFavorite: ctx.toggleFavorite,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
});
