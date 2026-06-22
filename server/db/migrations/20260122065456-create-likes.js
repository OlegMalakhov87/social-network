/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
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
        type: Sequelize.ENUM('Post', 'Music', 'Video', 'News', 'Comment'),
      },
      targetId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('Likes', ['userId'], {
      name: 'likesUserIdIdx',
    });
    await queryInterface.addIndex('Likes', ['targetType', 'targetId'], {
      name: 'likesTargetIdx',
    });
    await queryInterface.addConstraint('Likes', {
      fields: ['userId', 'targetType', 'targetId'],
      type: 'unique',
      name: 'uniqueLike',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
  },
};
