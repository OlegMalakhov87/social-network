const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate({ User, Post, Music, Video, News, Comment }) {
      // Пользователь, который поставил лайк
      this.belongsTo(User, { foreignKey: 'userId', as: 'users' });

      // Полиморфная связь с целевой сущностью
      this.belongsTo(Post, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Post',
        },
        as: 'posts',
      });

      this.belongsTo(Music, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Music',
        },
        as: 'tracks',
      });

      this.belongsTo(Video, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Video',
        },
        as: 'videos',
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
        as: 'comments',
      });
    }
  }
  Like.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      targetType: {
        type: DataTypes.ENUM('Post', 'Music', 'Video', 'News', 'Comment'),
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
      updatedAt: false,
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
