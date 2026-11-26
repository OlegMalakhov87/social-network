const { Op } = require('sequelize');

const { Post, Music, Video, News, Friend } = require('../../db/models');
const { createError } = require('./createError');

/**
 * Имя поля-владельца для каждой сущности.
 */
const OWNER_FIELD = {
  Post: 'userId',
  News: 'uploadedBy',
  Video: 'uploadedBy',
  Music: 'uploadedBy',
};

const VISIBLE_MODELS = {
  Post,
  Music,
  Video,
  News,
};

/**
 * Проверяет, что сущность видна текущему пользователю.
 *
 * Видна, если: пользователь владелец, сущность публичная или автор — друг.
 * Иначе — 404 (не подтверждаем существование приватной сущности).
 *
 * @param {import('sequelize').ModelStatic} model - Модель Sequelize
 * @param {'Post'|'News'|'Video'|'Music'} dbType - Тип сущности
 * @param {number} entityId - Идентификатор сущности
 * @param {number} currentUserId - Идентификатор текущего пользователя
 * @returns {Promise<Object>} Найденная сущность (только id, owner, isPublic)
 */
const assertEntityVisible = async (model, dbType, entityId, currentUserId) => {
  const ownerField = OWNER_FIELD[dbType];
  if (!ownerField) {
    throw createError(
      'Неподдерживаемый тип сущности',
      400,
      'INVALID_TARGET_TYPE'
    );
  }

  const entity = await model.findByPk(entityId, {
    attributes: ['id', ownerField, 'isPublic'],
  });

  if (!entity) {
    throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
  }

  const ownerId = entity[ownerField];

  if (ownerId === currentUserId || entity.isPublic === true) {
    return entity;
  }

  const friendship = await Friend.findOne({
    where: {
      [Op.or]: [
        { userId: currentUserId, friendId: ownerId },
        { userId: ownerId, friendId: currentUserId },
      ],
      status: 'accepted',
    },
  });

  if (!friendship) {
    throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
  }

  return entity;
};

module.exports = { assertEntityVisible, VISIBLE_MODELS };
