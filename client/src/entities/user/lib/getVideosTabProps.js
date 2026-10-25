/**
 * Возвращает свойства вкладки видео.
 *
 * @param {Object} ctx - Контекст вкладки
 * @returns {Object} Свойства вкладки видео
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
  currentVideo: ctx.currentVideo,
  isPlaying: ctx.isPlaying,
  addToLibrary: ctx.addToLibrary,
  deleteFromLibrary: ctx.deleteFromLibrary,
  updateLibraryViewsCount: ctx.updateLibraryViewsCount,
  toggleFavorite: ctx.toggleFavorite,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
  commentTarget: ctx.commentTarget,
  onCloseComments: ctx.onCloseComments,
  onCommentChange: ctx.onCommentChange,
});
