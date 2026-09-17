const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Music extends Model {
    static associate({ User, Like, Comment, UserMusicLibrary }) {
      // Кто загрузил оригинал
      this.belongsTo(User, {
        foreignKey: 'uploadedBy',
        as: 'uploader',
      });

      // У кого в библиотеке
      this.belongsToMany(User, {
        through: UserMusicLibrary,
        foreignKey: 'trackId',
        otherKey: 'userId',
        as: 'usersInLibrary',
      });

      // Промежуточная таблица
      this.hasMany(UserMusicLibrary, {
        foreignKey: 'trackId',
        as: 'libraryItems',
      });

      // Лайки и комментарии
      this.hasMany(Like, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Music' },
        as: 'likes',
      });

      this.hasMany(Comment, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { targetType: 'Music' },
        as: 'comments',
      });
    }
  }

  Music.init(
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
          len: [1, 100],
          notEmpty: true,
        },
      },
      artist: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      album: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: { len: [1, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 2000],
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
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 600,
        },
      },
      audioUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      coverUrl: {
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
      playsCount: {
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
      modelName: 'Music',
      tableName: 'Music',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['uploadedBy'] },
        { fields: ['createdAt'] },
        { fields: ['title'] },
        { fields: ['artist'] },
        { fields: ['category'] },
        { fields: ['isPublic'] },
        { fields: ['playsCount'] },
      ],
    }
  );

  return Music;
};
