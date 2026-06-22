const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate({ User, UserVideoLibrary, Like, Comment }) {
      // Кто загрузил оригинал
      this.belongsTo(User, {
        foreignKey: 'uploadedBy',
        as: 'uploader',
      });

      // У кого в библиотеке
      this.belongsToMany(User, {
        through: UserVideoLibrary,
        foreignKey: 'videoId',
        otherKey: 'userId',
        as: 'usersInLibrary',
      });

      // Промежуточная таблица
      this.hasMany(UserVideoLibrary, {
        foreignKey: 'videoId',
        as: 'libraryItems',
      });

      // Лайки и комментарии
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Video' },
        as: 'likes',
      });

      this.hasMany(Comment, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Video' },
        as: 'comments',
      });
    }
  }

  Video.init(
    {
      uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 2000],
          notEmpty: true,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 2000,
        },
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 1024,
        },
      },
      year: { type: DataTypes.INTEGER, allowNull: false },
      videoUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        validate: {
          isUrl: true,
        },
      },
      category: { type: DataTypes.STRING(50), allowNull: false },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },

    {
      sequelize,
      modelName: 'Video',
      tableName: 'Videos',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
      //underscored: true,
      indexes: [
        { fields: ['uploadedBy'] },
        { fields: ['createdAt'], order: 'DESC' },
        { fields: ['category'] },
        { fields: ['isPublic'] },
      ],
    }
  );

  return Video;
};
