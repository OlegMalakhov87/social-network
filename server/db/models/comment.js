const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate({ User, Post, Music, Video, News, Like }) {
      // Автор комментария
      this.belongsTo(User, { foreignKey: 'userId', as: 'author' });

      // Полиморфная связь с целевой сущностью
      this.belongsTo(Post, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Post' },
        as: 'posts',
      });

      this.belongsTo(Music, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Music' },
        as: 'tracks',
      });

      this.belongsTo(Video, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Video' },
        as: 'videos',
      });

      this.belongsTo(News, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'News' },
        as: 'news',
      });

      // Лайки комментария
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Comment',
        },
        as: 'likes',
      });
    }
  }
  Comment.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      targetType: {
        type: DataTypes.ENUM('Post', 'Music', 'Video', 'News'),
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
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
          notEmpty: true,
        },
      },
    },

    {
      sequelize,
      modelName: 'Comment',
      tableName: 'Comments',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [{ fields: ['userId'] }, { fields: ['targetType', 'targetId', 'createdAt'] }],
    }
  );
  return Comment;
};
