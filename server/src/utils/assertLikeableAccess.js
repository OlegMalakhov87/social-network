const {
  Post,
  Music,
  Video,
  News,
  Comment,
  Message,
} = require('../../db/models');
const { assertEntityVisible } = require('./assertEntityVisible');
const { createError } = require('./createError');

const VISIBLE_MODELS = {
  Post,
  Music,
  Video,
  News,
};

/**
 * Проверяет, что пользователь может взаимодействовать с сущностью.
 *
 * - Post/News/Video/Music: владелец, публичная или друг автора.
 * - Comment: видимость родительской сущности.
 * - Message: участие в переписке.
 *
 * При отказе — 404, чтобы не подтверждать существование приватного объекта.
 *
 * @param {Object} target - TARGET_TYPES[targetType]
 * @param {number} targetId - Идентификатор сущности
 * @param {number} currentUserId - Идентификатор текущего пользователя
 * @returns {Promise<Object>} Проверенная сущность
 */
const assertLikeableAccess = async (target, targetId, currentUserId) => {
  if (VISIBLE_MODELS[target.dbType]) {
    return assertEntityVisible(
      VISIBLE_MODELS[target.dbType],
      target.dbType,
      targetId,
      currentUserId
    );
  }

  if (target.dbType === 'Comment') {
    const comment = await Comment.findByPk(targetId, {
      attributes: ['id', 'targetType', 'targetId'],
    });

    if (!comment || !VISIBLE_MODELS[comment.targetType]) {
      throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
    }

    await assertEntityVisible(
      VISIBLE_MODELS[comment.targetType],
      comment.targetType,
      comment.targetId,
      currentUserId
    );

    return comment;
  }

  if (target.dbType === 'Message') {
    const message = await Message.findByPk(targetId, {
      attributes: ['id', 'senderId', 'receiverId'],
    });

    if (!message) {
      throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
    }

    if (
      message.senderId !== currentUserId &&
      message.receiverId !== currentUserId
    ) {
      throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
    }

    return message;
  }

  throw createError(
    'Неподдерживаемый тип сущности',
    400,
    'INVALID_TARGET_TYPE'
  );
};

module.exports = { assertLikeableAccess };
