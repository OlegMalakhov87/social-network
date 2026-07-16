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
  isOwnProfile: ctx.isOwnProfile,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onPlayVideo: ctx.onPlayVideo,
  toggleLike: ctx.toggleLike,
  deletePost: ctx.deletePost,
  updatePost: ctx.updatePost,
  toggleComments: ctx.toggleComments,
  onRetry: ctx.refetch,
});
