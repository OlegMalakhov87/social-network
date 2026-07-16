/**
 * Возвращает пропсы для вкладки "Треки".
 *
 * @param {Object} ctx
 * @returns {Object}
 */

export const getTracksTabProps = (ctx) => ({
  tracks: ctx.items,
  mode: ctx.mode,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isOwnProfile: ctx.isOwnProfile,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  currentTrack: ctx.currentTrack,
  isPlaying: ctx.isPlaying,
  onPlay: ctx.onPlay,
  onTrackStart: ctx.onTrackStart,
  togglePlay: ctx.togglePlay,
  toggleLike: ctx.toggleLike,
  addOptimistic: ctx.addOptimistic,
  removeOptimistic: ctx.removeOptimistic,
  updatePlayCount: ctx.updatePlayCount,
  toggleFavorite: ctx.toggleFavorite,
  toggleComments: ctx.toggleComments,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
});
