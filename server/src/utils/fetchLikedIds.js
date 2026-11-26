const { Op } = require('sequelize');
const { Like } = require('../../db/models');

/**
 * Возвращает Set id сущностей, которые лайкнул пользователь.
 *
 * @param {number|null} currentUserId - Идентификатор текущего пользователя
 * @param {string} targetType - Тип сущности ('Post'|'News'|'Video'|'Music')
 * @param {number[]} targetIds - Идентификаторы сущностей на странице
 * @returns {Promise<Set<number>>} Множество id лайкнутых сущностей.
 */
const fetchLikedIds = async (currentUserId, targetType, targetIds) => {
  if (!currentUserId || !Array.isArray(targetIds) || targetIds.length === 0) {
    return new Set();
  }

  const rows = await Like.findAll({
    where: {
      userId: currentUserId,
      targetType,
      targetId: { [Op.in]: targetIds },
    },
    attributes: ['targetId'],
    raw: true,
  });

  return new Set(rows.map((row) => row.targetId));
};

module.exports = { fetchLikedIds };
