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
      userId: { type: DataTypes.INTEGER, allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 5000],
          notEmpty: true,
        },
      },
      media: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
          notEmpty: true,
        },
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        { fields: ['userId', 'createdAt'] },
        { fields: ['isPublic'] },
        { fields: ['type'] },
      ],
    }
  );
  return Post;
};
