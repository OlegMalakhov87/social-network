const { Op } = require('sequelize');

const { RefreshSession } = require('../../db/models');

const authSessionCleanupService = {
  /**
   * Удаляет истекшие сессии обновления.
   *
   * История использованных маркеров удаляется каскадом ON DELETE CASCADE.
   *
   * @param {Object} [options] - Параметры удаления
   * @param {import('sequelize').Transaction} [options.transaction] - Транзакция Sequelize
   * @returns {Promise<number>} Число удаленных сессий.
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
