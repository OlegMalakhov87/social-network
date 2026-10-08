/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NewsIngestionRecords', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      source: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      externalId: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },

      externalUrl: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('published', 'rejected', 'failed'),
        allowNull: false,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      lastError: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      newsId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'News',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      processedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
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

    await queryInterface.addIndex(
      'NewsIngestionRecords',
      ['source', 'externalId'],
      {
        unique: true,
        name: 'newsIngestionRecordsSourceExternalIdUnique',
      }
    );

    await queryInterface.addIndex('NewsIngestionRecords', ['status'], {
      name: 'newsIngestionRecordsStatusIdx',
    });

    await queryInterface.addIndex('NewsIngestionRecords', ['newsId'], {
      name: 'newsIngestionRecordsNewsIdIdx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('NewsIngestionRecords');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_NewsIngestionRecords_status";'
    );
  },
};
