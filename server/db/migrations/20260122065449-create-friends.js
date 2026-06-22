/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friends', {
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
      friendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'blocked'),
        defaultValue: 'pending',
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
    await queryInterface.addConstraint('Friends', {
      fields: ['userId', 'friendId'],
      type: 'check',
      where: {
        userId: { [Sequelize.Op.ne]: Sequelize.col('friendId') },
      },
      name: 'preventSelfFriendship',
    });

    await queryInterface.addConstraint('Friends', {
      fields: ['userId', 'friendId'],
      type: 'unique',
      name: 'uniqueFriendship',
    });
    await queryInterface.addIndex('Friends', ['userId']);
    await queryInterface.addIndex('Friends', ['friendId']);
    await queryInterface.addIndex('Friends', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Friends');
  },
};
