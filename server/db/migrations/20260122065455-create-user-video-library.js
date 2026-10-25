/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserVideoLibraries', {
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
        allowNull: false,
        defaultValue: false,
      },
      lastWatchedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      viewsCount: {
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

    // Не даёт пользователю сохранить одно видео дважды.
    await queryInterface.addConstraint('UserVideoLibraries', {
      fields: ['userId', 'videoId'],
      type: 'unique',
      name: 'uniqueUserVideo',
    });

    await queryInterface.addIndex('UserVideoLibraries', ['userId']);
    await queryInterface.addIndex('UserVideoLibraries', ['videoId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserVideoLibraries');
  },
};
