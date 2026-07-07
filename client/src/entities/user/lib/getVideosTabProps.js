/**
 * Возвращает пропсы для вкладки "Видео".
 *
 * @param {Object} ctx
 * @returns {Object}
 */

export const getVideosTabProps = (ctx) => ({
  videos: ctx.items,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isProfileOwner: ctx.isProfileOwner,
  isLoading: ctx.isLoading,
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
});
