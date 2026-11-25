const { sequelize } = require('../../db/models');

/**
 * Возвращает SQL-литерал для подсчёта комментариев сущности.
 *
 * @param {'Post'|'News'|'Video'|'Music'} targetType - Тип сущности
 * @param {string} [alias] - SQL-алиас таблицы в JOIN.
 * По умолчанию равен targetType (когда модель на верхнем уровне).
 * Для вложенных include передавайте строчный алиас: 'video', 'track'.
 * @returns {Object} Sequelize literal
 */
const commentsCountLiteral = (targetType, alias = targetType) => {
  return sequelize.literal(`(
    SELECT COUNT(*) FROM "Comments"
    WHERE "Comments"."targetType" = '${targetType}'
      AND "Comments"."targetId" = "${alias}"."id"
  )`);
};

module.exports = { commentsCountLiteral };
