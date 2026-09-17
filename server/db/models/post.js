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
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 5000],
        },
      },
      postUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      previewUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
        validate: {
          notEmpty: true,
        },
      },
      pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isEdited: {
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
