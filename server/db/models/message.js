const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate({ User, Like }) {
      // Отправил сообщение
      this.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
      //Получил сообщение
      this.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

      // Лайки сообщения
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Message',
        },
        as: 'likes',
      });
    }
  }
  Message.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 2000],
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
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedByReceiver: {
        allowNull: false,
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
        { fields: ['senderId', 'createdAt'] },
        { fields: ['receiverId', 'createdAt'] },
        { fields: ['senderId', 'receiverId', 'createdAt'] },
      ],
    }
  );
  return Message;
};
