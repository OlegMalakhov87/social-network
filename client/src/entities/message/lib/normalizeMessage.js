/**
 * Приводит сырое сообщение с сервера к формату компонентов.
 * @param {Object} raw
 * @returns {Object}
 */
export const normalizeMessage = (raw) => ({
  id: raw.id,
  text: raw.message,
  createDate: raw.createdAt,
  updateDate: raw.updatedAt,
  isRead: raw.isRead,
  isEdited: raw.isEdited,
  senderId: raw.senderId,
  receiverId: raw.receiverId,
});
