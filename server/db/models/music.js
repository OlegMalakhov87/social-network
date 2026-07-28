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
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          notEmpty: true,
        },
      },
      album: { type: DataTypes.STRING(100), allowNull: false },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1900,
          max: new Date().getFullYear(),
          isInt: true,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 3600,
        },
      },
      audioUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      coverUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      genre: { type: DataTypes.STRING(50), allowNull: false },
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: [1, 2000],
          notEmpty: true,
        },
      },
      isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
      playCount: {
        type: DataTypes.INTEGER,
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
      updatedAt: false,
      //underscored: true,
      indexes: [
        { fields: ['uploadedBy'] },
        { fields: ['createdAt'], order: 'DESC' },
        { fields: ['genre'] },
        { fields: ['artist'] },
        { fields: ['isPublic'] },
      ],
    }
  );

  return Music;
};
