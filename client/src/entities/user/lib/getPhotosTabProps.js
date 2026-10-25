/**
 * Возвращает свойства вкладки фото.
 *
 * @param {Object} ctx - Контекст вкладки
 * @returns {Object} Свойства вкладки фото
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
  commentTarget: ctx.commentTarget,
  onCloseComments: ctx.onCloseComments,
  onCommentChange: ctx.onCommentChange,
  hasMore: ctx.hasMore,
  loadMore: ctx.loadMore,
  onRetry: ctx.refetch,
});
