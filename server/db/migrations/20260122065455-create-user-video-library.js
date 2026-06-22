/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserVideoLibraries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      videoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Videos', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastWatchedAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    // Уникальный индекс (один пользователь - одна запись на видео)
    await queryInterface.addConstraint('UserVideoLibraries', {
      fields: ['userId', 'videoId'],
      type: 'unique',
      name: 'uniqueUserVideo',
    });
    // Индексы для быстрого поиска
    await queryInterface.addIndex('UserVideoLibraries', ['userId']);
    await queryInterface.addIndex('UserVideoLibraries', ['videoId']);
    await queryInterface.addIndex('UserVideoLibraries', ['isFavorite']);
    await queryInterface.addIndex('UserVideoLibraries', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserVideoLibraries');
  },
};
