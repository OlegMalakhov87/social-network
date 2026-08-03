const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate({ User, Post, Music, Video, News, Comment, Message }) {
      // Пользователь, который поставил лайк
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' });

      // Полиморфная связь с целевой сущностью
      this.belongsTo(Post, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Post',
        },
        as: 'post',
      });

      this.belongsTo(Music, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Music',
        },
        as: 'track',
      });

      this.belongsTo(Video, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Video',
        },
        as: 'video',
      });

      this.belongsTo(News, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'News',
        },
        as: 'news',
      });

      this.belongsTo(Comment, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Comment',
        },
        as: 'comment',
      });

      this.belongsTo(Message, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Message',
        },
        as: 'message',
      });
    }
  }
  Like.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      targetType: {
        type: DataTypes.ENUM(
          'Post',
          'Music',
          'Video',
          'News',
          'Comment',
          'Message'
        ),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
    },

    {
      sequelize,
      modelName: 'Like',
      tableName: 'Likes',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['targetType', 'targetId'] },
        {
          fields: ['userId', 'targetType', 'targetId'],
          unique: true,
        },
      ],
    }
  );
  return Like;
};
