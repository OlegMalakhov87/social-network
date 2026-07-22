/**
 * Возвращает пропсы для вкладки "Фото".
 *
 * @param {Object} ctx - контекст компонента
 * @returns {Object} - пропсы для вкладки "Фото"
 */

export const getPhotosTabProps = (ctx) => ({
  photos: ctx.items,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isOwnProfile: ctx.isOwnProfile,
  isLoading: ctx.isLoading,
  isLoadingMore: ctx.isLoadingMore,
  error: ctx.error,
  toggleLike: ctx.toggleLike,
  deletePhoto: ctx.deletePhoto,
  toggleComments: ctx.toggleComments,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
});
