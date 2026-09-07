/**
 * Возвращает пропсы для вкладки "Треки".
 *
 * @param {Object} ctx - контекст компонента
 * @returns {Object} - пропсы для вкладки "Треки"
 */

export const getTracksTabProps = (ctx) => ({
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  toggleComments: ctx.toggleComments,
  isOwnProfile: ctx.isOwnProfile,
  toggleLike: ctx.toggleLike,
  tracks: ctx.items,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  mode: ctx.mode,
  currentTrack: ctx.currentTrack,
  isPlaying: ctx.isPlaying,
  onPlay: ctx.onPlay,
  onTrackStart: ctx.onTrackStart,
  togglePlay: ctx.togglePlay,
  addOptimistic: ctx.addOptimistic,
  deleteOptimistic: ctx.deleteOptimistic,
  updatePlaysCount: ctx.updatePlaysCount,
  toggleFavorite: ctx.toggleFavorite,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
  commentTarget: ctx.commentTarget,
  onCloseComments: ctx.onCloseComments,
  onCommentChange: ctx.onCommentChange,
});
