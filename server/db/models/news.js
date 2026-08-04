const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate({ User, Like, Comment }) {
      // Кто загрузил
      this.belongsTo(User, {
        foreignKey: 'uploadedBy',
        as: 'uploader',
      });

      // Лайки новости
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'News',
        },
        as: 'likes',
      });

      // Комментарии к новости
      this.hasMany(Comment, {
        foreignKey: 'targetId',
        constraints: false,
        scope: {
          targetType: 'News',
        },
        as: 'comments',
      });
    }
  }
  News.init(
    {
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 5000],
          notEmpty: true,
        },
      },
      date: { type: DataTypes.DATEONLY, allowNull: true },
      author: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [1, 50],
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      source: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [1, 100],
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
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'News',
      tableName: 'News',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['date'] },
        { fields: ['category'] },
        { fields: ['viewsCount'] },
        { fields: ['type'] },
        { fields: ['author'] },
      ],
    }
  );
  return News;
};
