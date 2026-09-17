/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserMusicLibraries', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
        allowNull: false,
        defaultValue: false,
      },
      playsCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserMusicLibraries');
  },
};
