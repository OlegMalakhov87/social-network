const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate({ User, Like, Comment }) {
      // Автор поста
      this.belongsTo(User, { foreignKey: 'userId', as: 'author' });

      // Лайки поста
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Post',
        },
        as: 'likes',
      });

      //Комментарии поста
      this.hasMany(Comment, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'Post',
        },
        as: 'comments',
      });
    }
  }
  Post.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 2000],
          notEmpty: true,
        },
      },
      mediaUrl: {
        type: DataTypes.STRING(500),
      },
      visibility: {
        type: DataTypes.ENUM('public', 'friends', 'private'),
        defaultValue: 'public',
      },
      postType: {
        type: DataTypes.ENUM('text', 'image', 'video'),
        defaultValue: 'text',
      },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'Posts',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['createdAt'], order: 'DESC' },
        { fields: ['visibility'] },
      ],
    }
  );
  return Post;
};
