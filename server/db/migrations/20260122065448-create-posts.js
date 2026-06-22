/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
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
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mediaUrl: {
        type: Sequelize.STRING(500),
      },
      visibility: {
        type: Sequelize.ENUM('public', 'friends', 'private'),
        defaultValue: 'public',
      },
      postType: {
        type: Sequelize.ENUM('text', 'image', 'video'),
        defaultValue: 'text',
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
    await queryInterface.addIndex('Posts', ['userId']);
    await queryInterface.addIndex('Posts', ['createdAt'], { order: 'DESC' });
    await queryInterface.addIndex('Posts', ['visibility']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  },
};
