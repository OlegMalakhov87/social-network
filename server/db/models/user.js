const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      //Обращение напрямую без this
      // Посты пользователя
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });

      // Музыка пользователя
      User.hasMany(models.Music, { foreignKey: 'uploadedBy', as: 'tracks' });

      // Видео пользователя
      User.hasMany(models.Video, { foreignKey: 'uploadedBy', as: 'videos' });

      // Новости пользователя
      User.hasMany(models.News, { foreignKey: 'uploadedBy', as: 'news' });

      // Отправленные сообщения
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages',
      });

      // Полученные сообщения
      User.hasMany(models.Message, {
        foreignKey: 'receiverId',
        as: 'receivedMessages',
      });

      // Лайки пользователя
      User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });

      // Комментарии пользователя
      User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });

      // Друзья (исходящие запросы)
      User.hasMany(models.Friend, {
        foreignKey: 'userId',
        as: 'sentFriendRequests',
      });

      // Друзья (входящие запросы)
      User.hasMany(models.Friend, {
        foreignKey: 'friendId',
        as: 'receivedFriendRequests',
      });

      // Медиа в библиотеке пользователя (many-to-many)
      User.belongsToMany(models.Music, {
        through: models.UserMusicLibrary,
        foreignKey: 'userId',
        otherKey: 'trackId',
        as: 'musicLibrary',
      });

      User.belongsToMany(models.Video, {
        through: models.UserVideoLibrary,
        foreignKey: 'userId',
        otherKey: 'videoId',
        as: 'videoLibrary',
      });
      // Промежуточные таблицы
      User.hasMany(models.UserMusicLibrary, {
        foreignKey: 'userId',
        as: 'musicLibraryItems',
      });
      User.hasMany(models.UserVideoLibrary, {
        foreignKey: 'userId',
        as: 'videoLibraryItems',
      });
    }
  }

  User.init(
    {
      nickname: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 14,
          max: 99,
          isInt: true,
        },
      },
      email: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 55],
          notEmpty: true,
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 500],
          notEmpty: true,
        },
      },
      job: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 500],
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING(25),
        allowNull: true,
        unique: true,
        validate: {
          len: [5, 25],
          notEmpty: true,
        },
      },
      avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: '/user.png',
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
      passwordHash: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          len: [60, 60],
          notEmpty: true,
        },
      },
    },

    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['email'] },
        { fields: ['nickname'] },
        { fields: ['name'] },
      ],
    }
  );
  return User;
};
