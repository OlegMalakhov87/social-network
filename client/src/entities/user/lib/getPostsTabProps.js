/**
 * Возвращает пропсы для вкладки "Посты".
 *
 * @param {Object} ctx
 * @returns {Object}
 */

export const getPostsTabProps = (ctx) => ({
  posts: ctx.items,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isProfileOwner: ctx.isProfileOwner,
  isLoading: ctx.isLoading,
  error: ctx.error,
  onPlayVideo: ctx.onPlayVideo,
  toggleLike: ctx.toggleLike,
  deletePost: ctx.deletePost,
  toggleComments: ctx.toggleComments,
});
