/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UsedRefreshTokens', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      sessionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'RefreshSessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      tokenHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('UsedRefreshTokens', ['sessionId'], {
      name: 'used_refresh_tokens_session_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UsedRefreshTokens');
  },
};
