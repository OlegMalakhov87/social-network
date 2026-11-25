const { sequelize } = require('../../db/models');

/**
 * Возвращает SQL-литерал для подсчёта лайков сущности.
 *
 * @param {string} targetType - Тип сущности ('Post'|'News'|'Video'|'Music')
 * @param {string} [alias] - SQL-алиас таблицы в JOIN (для вложенных include).
 * @returns {Object} Sequelize literal
 */
const likeCountLiteral = (targetType, alias = targetType) =>
  sequelize.literal(`(
    SELECT COUNT(*) FROM "Likes"
    WHERE "Likes"."targetType" = '${targetType}'
      AND "Likes"."targetId" = "${alias}"."id"
  )`);

module.exports = { likeCountLiteral };
