/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserMusicLibraries', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Music', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      playCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    // Уникальный индекс (один пользователь - одна запись на музыку)
    await queryInterface.addConstraint('UserMusicLibraries', {
      fields: ['userId', 'trackId'],
      type: 'unique',
      name: 'uniqueUserMusic',
    });

    // Индексы для быстрого поиска
    await queryInterface.addIndex('UserMusicLibraries', ['userId']);
    await queryInterface.addIndex('UserMusicLibraries', ['trackId']);
    await queryInterface.addIndex('UserMusicLibraries', ['isFavorite']);
    await queryInterface.addIndex('UserMusicLibraries', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserMusicLibraries');
  },
};
