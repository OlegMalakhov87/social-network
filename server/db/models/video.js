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
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 2000],
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 1800,
        },
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
          min: 1024,
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
      videoUrl: {
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
      previewUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
