const { Op } = require('sequelize');
const { sequelize, Comment, Like } = require('../../db/models');

/**
 * Удаляет сущность вместе с её комментариями, лайками и лайками комментариев.
 * Всё в одной транзакции — либо всё удалится, либо ничего.
 *
 * @param {Object} params
 * @param {Object} params.entity - экземпляр Sequelize-модели (Music, Post, Video, News)
 * @param {string} params.targetType - тип сущности для комментариев и лайков ('Music', 'Post', 'Video', 'News')
 * @param {string} [params.idField='id'] - имя поля с ID сущности (по умолчанию 'id')
 * @returns {Promise<Object>} - { deleted: { comments, likes, commentLikes } }
 */
const deleteEntityWithRelations = async ({
  entity,
  targetType,
  idField = 'id',
}) => {
  const entityId = entity[idField];

  return await sequelize.transaction(async (transaction) => {
    // Находим комментарии сущности
    const comments = await Comment.findAll({
      where: { targetType, targetId: entityId },
      attributes: ['id'],
      transaction,
    });

    const commentIds = comments.map((c) => c.id);

    // Удаляем лайки комментариев
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

    // Удаляем лайки самой сущности
    const deletedLikes = await Like.destroy({
      where: { targetType, targetId: entityId },
      transaction,
    });

    // Удаляем комментарии сущности
    const deletedComments = await Comment.destroy({
      where: { targetType, targetId: entityId },
      transaction,
    });

    // Удаляем саму сущность
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
