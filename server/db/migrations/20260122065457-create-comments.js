/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
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
      targetType: {
        type: Sequelize.STRING,
        allowNull: false,
        type: Sequelize.ENUM('Post', 'Music', 'Video', 'News'),
      },
      targetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.addIndex('Comments', ['targetType', 'targetId', 'createdAt']);
    await queryInterface.addIndex('Comments', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  },
};
