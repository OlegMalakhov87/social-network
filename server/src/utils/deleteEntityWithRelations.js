const { Op } = require('sequelize');

const { sequelize, Comment, Like } = require('../../db/models');

/**
 * Удаляет сущность вместе с комментариями, лайками и лайками комментариев.
 *
 * Выполняет удаление в одной транзакции Sequelize: сохраняет все записи или не удаляет ничего.
 *
 * @param {Object} params - Параметры удаления
 * @param {import('sequelize').Model} params.entity - Экземпляр сущности
 * @param {string} params.targetType - Тип сущности для комментариев и лайков
 * @param {string} [params.idField='id'] - Имя поля с идентификатором сущности
 * @returns {Promise<{deleted: {comments: number, likes: number, commentLikes: number}}>} Число удаленных записей.
 */
const deleteEntityWithRelations = async ({
  entity,
  targetType,
  idField = 'id',
}) => {
  const entityId = entity[idField];

  return await sequelize.transaction(async (transaction) => {
    const comments = await Comment.findAll({
      where: { targetType, targetId: entityId },
      attributes: ['id'],
      transaction,
    });

    const commentIds = comments.map((c) => c.id);

    let deletedCommentLikes = 0;
    if (commentIds.length > 0) {
      deletedCommentLikes = await Like.destroy({
        where: {
          targetType: 'Comment',
          targetId: { [Op.in]: commentIds },
        },
        transaction,
      });
    }

    const deletedLikes = await Like.destroy({
      where: { targetType, targetId: entityId },
      transaction,
    });

    const deletedComments = await Comment.destroy({
      where: { targetType, targetId: entityId },
      transaction,
    });

    await entity.destroy({ transaction });

    return {
      deleted: {
        comments: deletedComments,
        likes: deletedLikes,
        commentLikes: deletedCommentLikes,
      },
    };
  });
};

module.exports = { deleteEntityWithRelations };
