/**
 * Возвращает пропсы для вкладки "Фото".
 *
 * @param {Object} ctx
 * @returns {Object}
 */

export const getPhotosTabProps = (ctx) => ({
  photos: ctx.items,
  currentUser: ctx.currentUser,
  targetUser: ctx.targetUser,
  isProfileOwner: ctx.isProfileOwner,
  isLoading: ctx.isLoading,
  error: ctx.error,
  toggleLike: ctx.toggleLike,
  deletePhoto: ctx.deletePhoto,  
  toggleComments: ctx.toggleComments,
});
