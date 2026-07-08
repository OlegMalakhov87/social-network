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
  isProfileOwner: ctx.isProfileOwner,
  isLoading: ctx.isLoading,
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
});
