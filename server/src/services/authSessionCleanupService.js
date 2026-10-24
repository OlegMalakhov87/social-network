const { Op } = require('sequelize');
const { RefreshSession } = require('../../db/models');

const authSessionCleanupService = {
  /**
   * Удаляет истёкшие refresh-сессии.
   * История UsedRefreshTokens удаляется через ON DELETE CASCADE.
   *
   * @param {Object} [options]
   * @param {import('sequelize').Transaction} [options.transaction]
   * @returns {Promise<number>} Количество удалённых сессий.
   */
  async cleanupExpired({ transaction } = {}) {
    return RefreshSession.destroy({
      where: {
        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
      transaction,
    });
  },
};

module.exports = authSessionCleanupService;
