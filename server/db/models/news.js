const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate({ Like, Comment }) {
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [5, 200],
          notEmpty: true,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 5000],
        },
      },
      date: DataTypes.DATEONLY,
      author: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      source: DataTypes.STRING(100),
      imageUrl: {
        type: DataTypes.STRING(500),
        validate: {
          isUrl: true,
        },
      },
      viewCount: {
        type: DataTypes.INTEGER,
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
      updatedAt: false,
      //underscored: true,
      indexes: [{ fields: ['date'], order: 'DESC' }, { fields: ['category'] }],
    }
  );
  return News;
};
