/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedBySender: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedByReceiver: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.addConstraint('Messages', {
      fields: ['senderId', 'receiverId'],
      type: 'check',
      where: {
        senderId: {
          [Sequelize.Op.ne]: Sequelize.col('receiverId'),
        },
      },
      name: 'preventSelfMessage',
    });
    await queryInterface.addIndex('Messages', ['senderId', 'createdAt'], {
      name: 'messagesSenderCreatedAt',
    });
    await queryInterface.addIndex('Messages', ['receiverId', 'createdAt'], {
      name: 'messagesReceiverCreatedAt',
    });
    await queryInterface.addIndex(
      'Messages',
      ['senderId', 'receiverId', 'createdAt'],
      {
        name: 'messagesSenderReceiverCreatedAt',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  },
};
