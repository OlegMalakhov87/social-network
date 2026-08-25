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
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
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
        defaultValue: 'Untitled',
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 2000],
          notEmpty: true,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 1800,
          isInt: true,
        },
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
          min: 1024,
          isInt: true,
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1900,
          max: new Date().getFullYear(),
          isInt: true,
        },
      },
      videoUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: '/default-video.mp4',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
          notEmpty: true,
        },
      },
      previewUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
          notEmpty: true,
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'other',
        validate: {
          len: [1, 50],
          notEmpty: true,
        },
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0,
          isInt: true,
        },
      },
    },

    {
      sequelize,
      modelName: 'Video',
      tableName: 'Videos',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['uploadedBy'] },
        { fields: ['createdAt'] },
        { fields: ['title'] },
        { fields: ['category'] },
        { fields: ['isPublic'] },
        { fields: ['viewsCount'] },
      ],
    }
  );

  return Video;
};
