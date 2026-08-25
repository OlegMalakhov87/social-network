/**
 * Возвращает пропсы для вкладки "Посты".
 *
 * @param {Object} ctx - контекст компонента
 * @returns {Object} - пропсы для вкладки "Посты"
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
  onPlayPost: ctx.onPlayPost,
  currentPost: ctx.currentPost,
  isPlaying: ctx.isPlaying,
  toggleLike: ctx.toggleLike,
  deletePost: ctx.deletePost,
  updatePost: ctx.updatePost,
  toggleComments: ctx.toggleComments,
  onRetry: ctx.refetch,
});
