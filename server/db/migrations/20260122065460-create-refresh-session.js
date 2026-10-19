
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshSessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
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

      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('RefreshSessions', ['userId'], {
      name: 'refresh_sessions_user_id',
    });

    await queryInterface.addIndex('RefreshSessions', ['expiresAt'], {
      name: 'refresh_sessions_expires_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('RefreshSessions');
  },
};
