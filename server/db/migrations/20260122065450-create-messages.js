/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      receiverId: {
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
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletedBySender: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletedByReceiver: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.addIndex('Messages', ['senderId', 'createdAt'], {
      name: 'messagesSenderCreatedAt',
      order: 'DESC',
    });
    await queryInterface.addIndex('Messages', ['receiverId', 'createdAt'], {
      name: 'messagesReceiverCreatedAt',
      order: 'DESC',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  },
};
