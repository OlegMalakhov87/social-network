const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate({ User }) {
      // Отправил сообщение
      this.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
      //Получил сообщение
      this.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
    }
  }
  Message.init(
    {
      senderId: DataTypes.INTEGER,
      receiverId: DataTypes.INTEGER,
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
          notEmpty: true,
        },
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedBySender: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedByReceiver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: 'Message',
      tableName: 'Messages',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      // underscored: true,
      indexes: [
        { fields: ['senderId', 'createdAt'], order: 'DESC' },
        { fields: ['receiverId', 'createdAt'], order: 'DESC' },
      ],
    }
  );
  return Message;
};
