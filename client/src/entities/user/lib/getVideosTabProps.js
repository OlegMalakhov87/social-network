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
  toggleComments: ctx.toggleComments,
  isOwnProfile: ctx.isOwnProfile,
  toggleLike: ctx.toggleLike,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  mode: ctx.mode,
  onPlayVideo: ctx.onPlayVideo,
  onVideoStart: ctx.onVideoStart,
  addToLibrary: ctx.addToLibrary,
  deleteFromLibrary: ctx.deleteFromLibrary,
  updateLibraryViewsCount: ctx.updateLibraryViewsCount,
  toggleFavorite: ctx.toggleFavorite,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
});
